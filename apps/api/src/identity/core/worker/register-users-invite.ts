import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { InviteEvent } from '@src/shared/event'
import { ApplicationException } from '@src/shared/exception/application.exception'
import { UserRegister } from '../services'

@Injectable()
export class RegisterUsersByInvite {
	constructor(private readonly userRegister: UserRegister) {}

	@RabbitSubscribe({
    exchange: 'exchange.invite',
    routingKey: InviteEvent.CREATED_INVITATION,
    queue: 'project.created.invitation',
  })
	async execute(message: string) {
		try {
			const data = JSON.parse(message)

		  await this.userRegister.execute({
				// accountId: data.accountId, 
				password: data.password,
				organizationId: data.organizationId,
				email: data.email,
			})
		} catch (error) {
			throw new ApplicationException({ message: '', suggestedHttpStatusCode: 500 })
		}
	}
}