import { Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@src/shared/config/service/config.service'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { DateUtils } from '@src/shared/lib/date-utils'
import { InvitationRepository } from '@src/project/persist/repository/invitation.repository'
import { ExternalIdentityClient } from '@src/project/http/client/external-client-identity'
import { InviteMemberCommand } from '../contract'
import { InviteEvent } from '@src/shared/event'


@Injectable()
export class InviteMemberService {
  private readonly secret: string;

  constructor(
    private readonly inviteRepo: InvitationRepository,
    private readonly event: BrokerService,
    private readonly generator: JwtService,
    private readonly publicAPI: ExternalIdentityClient,
    configService: ConfigService,
  ) {
    this.secret = configService.get('secret_token')
  }

  private async generateInviteToken(command: InviteMemberCommand): Promise<string> {
    const payload = {
      sub: command.guestEmail,
      hostUserId: command.hostId,
      status: 'pending',
    };

    return this.generator.signAsync(payload, {
      expiresIn: '7d',
      secret: this.secret,
    })
  }

  async execute(command: InviteMemberCommand) {
    const [account, host] = await Promise.all([
      this.publicAPI.findAccountById(command.accountId),
      this.publicAPI.findUserById(command.hostId),
    ])

    if (!account || !host) throw new NotFoundException('Invalid account or host user')

    const inviteToken = await this.generateInviteToken(command)
    const invitation = await this.inviteRepo.persist({
      token: inviteToken,
      hostId: command.hostId,
      accountId: command.accountId,
      projectId: command.projectId,
      guestEmail: command.guestEmail,
      expiresIn: DateUtils.generateFutureDate(7),
      role: command.permissions[0] as any,
    })
    
    await this.event.emit('exchange.invite', InviteEvent.CREATED_INVITATION, invitation)
    return invitation
  }
}
