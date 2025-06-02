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
import { Transactional } from 'typeorm-transactional'


@Injectable()
export class InviteMemberService {
  private readonly secret: string;

  constructor(
    private readonly invites: InvitationRepository,
    private readonly projects: ProjectRepository,
    private readonly broker: BrokerService,
    private readonly jwt: JwtService,
    private readonly identity: ExternalIdentityClient,
    config: ConfigService,
  ) {
    this.secret = config.get('secret_token')
  }

  private async loadEntities({ hostId, accountId, projectId, guestEmail }: InviteMemberCommand) {
    const [project, guest] = await Promise.all([
      this.projects.find({ where: { id: projectId }, relations: ['members'] }),
      this.identity.findUserByEmail(guestEmail),
    ])

    if (!guest) throw new NotFoundException(`Guest user with email ${guestEmail} not found`)

    return { project, guest }
  }

  private async getInviteStats(projectId: string, email: string) {
    const [userPending, totalPending] = await Promise.all([
      this.invites.findMany({ where: { project_id: projectId, email, status: 'pending' } }),
      this.invites.findMany({ where: { project_id: projectId, status: 'pending' } }),
    ])

    return { userCount: userPending.length, totalCount: totalPending.length }
  }

  private createToken({ guestEmail, hostId }: InviteMemberCommand) {
    return this.jwt.signAsync(
      { sub: guestEmail, hostUserId: hostId, status: 'pending' },
      { expiresIn: '7d', secret: this.secret }
    )
  }

  @Transactional()
  async execute(command: InviteMemberCommand): Promise<Invitation> {
    const { project, guest } = await this.loadEntities(command)
    const { userCount, totalCount } = await this.getInviteStats(project.id, command.guestEmail)

    Invite.checkPolicies(project, command.hostId, userCount, totalCount, guest.id)

    const token = await this.createToken(command)

    const invitation = await this.invites.persist({
      token,
      hostId: command.hostId,
      accountId: command.accountId,
      projectId: command.projectId,
      guestEmail: command.guestEmail,
      expiresIn: DateUtils.generateFutureDate(7),
      role: command.permissions[0] as any,
    })

    await this.broker.emit('exchange.invite', InviteEvent.CREATED_INVITATION, {
      token,
      accountId: command.accountId,
      projectId: command.projectId,
      role: command.permissions[0],
    })

    return invitation
  }
}
