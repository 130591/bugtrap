import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@src/shared/config/service/config.service'
import { PublisherService } from '@src/shared/lib/hive'
import { DateUtils } from '@src/shared/lib/date-utils'
import { ProjectRepository } from '@src/project/persist/repository'
import { InvitationRepository } from '@src/project/persist/repository/invitation.repository'
import { ExternalIdentityClient } from '@src/project/http/client/external-client-identity'
import { InviteMemberCommand } from '../contract'
import { InviteEvent } from '@src/shared/event'


@Injectable()
export class InviteMemberService {
  private readonly secret: string;

  constructor(
    private readonly inviteRepo: InvitationRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly event: PublisherService,
    private readonly generator: JwtService,
    private readonly publicAPI: ExternalIdentityClient,
    configService: ConfigService,
  ) {
    this.secret = configService.get('secret_token')
  }

  private validateEntities(account: any, host: any): void {
    if (!account || !account.length) throw new NotFoundException('Account not found')
    if (!host) throw new NotFoundException('User not found')
  }

  private async generateInviteToken(command: InviteMemberCommand): Promise<string> {
    const payload = {
      sub: command.guestEmail,
      hostUserId: command.hostId,
      status: 'pending',
    }

    return this.generator.signAsync(payload, {
      expiresIn: '7d',
      secret: this.secret,
    })
  }

  private async createInvitation(command: InviteMemberCommand, token: string) {
    const invitationData = {
      token,
      hostId: command.hostId,
      accountId: command.accountId,
      projectId: command.projectId,
      guestEmail: command.guestEmail,
      expiresIn: DateUtils.generateFutureDate(7),
      role: command.permissions[0] as any,
    }

    return await this.inviteRepo.persist(invitationData)
  }

  async execute(command: InviteMemberCommand) {
    const [account, host, user] = await Promise.all([
      this.publicAPI.findAccountById(command.accountId),
      this.publicAPI.findUserById(command.hostId),
      this.publicAPI.findUserByEmail(command.guestEmail)
    ])

    const member = await this.projectRepo.find({ where: { members: { user_id: user.id } } })
    if (member)  throw new ConflictException('User is already a member of this project')

    this.validateEntities(account, host)

    const inviteToken = await this.generateInviteToken(command)
    const invitation = await this.createInvitation(command, inviteToken)
    await this.event.emit(InviteEvent.CREATED_INVITATION, invitation)
    return invitation
  }
}  
 