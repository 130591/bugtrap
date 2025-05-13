import { Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InviteEvent } from '@src/shared/event'
import { ConfigService } from '@src/shared/config/service/config.service'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { DateUtils } from '@src/shared/lib/date-utils'
import { ProjectRepository } from '@src/project/persist/repository'
import { InvitationEntity as Invitation } from '@src/project/persist/entities/invite.entity'
import { InvitationRepository } from '@src/project/persist/repository/invitation.repository'
import { ExternalIdentityClient } from '@src/project/http/client/external-client-identity'
import { InviteMemberCommand } from '../contract'
import { Invite } from './policies'

@Injectable()
export class InviteMemberService {
  private readonly secret: string

  constructor(
    private readonly inviteRepo: InvitationRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly broker: BrokerService,
    private readonly jwt: JwtService,
    private readonly identity: ExternalIdentityClient,
    configService: ConfigService,
  ) {
    this.secret = configService.get('secret_token')
  }

  private async getEntities(command: InviteMemberCommand) {
    const [hostUser, account, project, guestUser] = await Promise.all([
      this.identity.findUserById(command.hostId),
      this.identity.findAccountById(command.accountId),
      this.projectRepo.find({ where: { id: command.projectId }, relations: ['members'] }),
      this.identity.findUserByEmail(command.guestEmail),
    ])

    if (!hostUser || !account) throw new NotFoundException('Host user or account not found')
    if (!guestUser) throw new NotFoundException('Guest user does not exist')

    return { hostUser, account, project, guestUser }
  }

  private async findPendingStats(projectId: string, email: string) {
    const [userPendingInvites, totalPending] = await Promise.all([
      this.inviteRepo.findMany({ where: { project_id: projectId, email, status: 'pending' } }),
      this.inviteRepo.findMany({ where: { project_id: projectId, status: 'pending' } }),
    ])
    return { userPendingInvitesCount: userPendingInvites.length, totalPendingCount: totalPending.length }
  }

  private generateInviteToken(command: InviteMemberCommand): Promise<string> {
    return this.jwt.signAsync(
      {
        sub: command.guestEmail,
        hostUserId: command.hostId,
        status: 'pending',
      },
      { expiresIn: '7d', secret: this.secret },
    )
  }

  async execute(command: InviteMemberCommand): Promise<Invitation> {
    const { project, guestUser } = await this.getEntities(command)
    
    const { userPendingInvitesCount, totalPendingCount } = await this.findPendingStats(
      project.id,
      command.guestEmail,
    )  

    Invite.checkPolicies(project, command.hostId, userPendingInvitesCount, totalPendingCount, guestUser.id)

    const token = await this.generateInviteToken(command)
    const invitation = await this.inviteRepo.persist({
      token,
      hostId: command.hostId,
      accountId: command.accountId,
      projectId: command.projectId,
      guestEmail: command.guestEmail,
      expiresIn: DateUtils.generateFutureDate(7),
      role: command.permissions[0] as any,
    })

    await this.broker.emit('exchange.invite', InviteEvent.CREATED_INVITATION, invitation)
    return invitation
  }
}
