import { Injectable, Logger } from '@nestjs/common'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { UserRegister } from '../services'
import { randomUUID } from 'node:crypto'


@Injectable()
export class RegisterNewUser {
	private readonly logger = new Logger(RegisterNewUser.name)

	constructor(private readonly userRegister: UserRegister) {}

	@RabbitSubscribe({
		exchange: 'exchange.identity',
		routingKey: 'account.registered',
		queue: 'queue.user.registed',
		queueOptions: { 
			durable: true, 
			arguments: { 
			'x-dead-letter-exchange': 'exchange.identity.dlx', // Dead letter exchange
			'x-dead-letter-routing-key': 'dlx.account.registered', // Routing key da DLQ
			'x-message-ttl': 10000,
		 }}
	})
	async handleRegisterUser(message) {
		this.logger.log(`Starting register user...`)

		try {
			const data = JSON.parse(message)
			const userId = randomUUID()

		  await this.userRegister.execute({
				password: data.password,
				organizationId: data.organizationId,
				email: ''
			})
			
			this.logger.log(`User ${data.email} created for account ${data.accountId}`)
		} catch (error) {
			this.logger.error(`Error creating user : ${error.message}`)
		}
	}
}