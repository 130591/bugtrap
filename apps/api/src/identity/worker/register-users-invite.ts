import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { InviteEvent } from '@src/shared/event'
import { ExternalAuth0Client } from '../http/integration/integration-auth0.client'
import { ApplicationException } from '@src/shared/exception/application.exception'

@Injectable()
export class RegisterUsersByInvite {
	constructor(private readonly auth0Client:ExternalAuth0Client) {}

	@RabbitSubscribe({
    exchange: 'exchange.invite',
    routingKey: InviteEvent.CREATED_INVITATION,
    queue: 'queue.register.user.invite',
  })
	async execute(message: string) {
		try {
			console.log('queue.register.user.invite', message)
			const data = JSON.parse(message)
		  await this.auth0Client.inviteUserWithPasswordSetup(data.email)
		} catch (error) {
			throw new ApplicationException({ message: '', suggestedHttpStatusCode: 500 })
		}
	}
}