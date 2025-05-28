import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Injectable, Logger } from '@nestjs/common'
import { ExternalAuth0Client } from '../../integration/integration-auth0.client'


@Injectable()
export class InviteExpired {
  private readonly logger = new Logger(InviteExpired.name)

  constructor(private readonly auth0Client: ExternalAuth0Client) {}

  @RabbitSubscribe({
    exchange: 'exchange.invite',
    routingKey: 'invite.expired',
    queue: 'queue.invite.expired',
  })
  async handleInviteExpired(msg: { email: string }) {
    this.logger.log(`Removing user ${msg.email} from Auth0`)

    try {
      await this.auth0Client.deleteUserByEmail(msg.email)
      this.logger.log(`User ${msg.email} removed from Auth0`)
    } catch (error) {
      this.logger.error(`Error deleting user from Auth0: ${error.message}`)
    }
  }
}
