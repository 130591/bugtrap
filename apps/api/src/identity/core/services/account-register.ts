import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { AccountStatus } from '@src/identity/persist/entities/account.entity'
import { AccountRepository } from '@src/identity/persist/repository/account.repository'
import { ExternalAuth0Client } from '@src/identity/http/integration/integration-auth0.client'

export interface RegisterAccountCommand {
  email: string,
  userId: string,
	termsAccepted: boolean
}

@Injectable()
export class AccountRegisterService {
	constructor(
		private readonly broker: BrokerService,
		private readonly client: ExternalAuth0Client,
    private readonly repository: AccountRepository,
	) {}

	async execute(command: RegisterAccountCommand) {
    const [userInfo, existingAccount] = await Promise.all([
      await this.client.getUserByAuth0Email(command.email),
      await this.repository.find({ where: { email: command.email } })
    ])

    if (!userInfo) throw new UnauthorizedException('Unable to decode user info, invalid token')
      
    if (existingAccount) {
      throw new ConflictException('An account already exists with the provided email')
    }
  
    const account = await this.repository.persist({
      email: userInfo.email,
      name: userInfo.username,
			firstName: userInfo.given_name,
			lastName: userInfo.family_name,
			termsAccepted: command.termsAccepted,
      userId: userInfo.user_id,
      status: AccountStatus.PENDING
    })
		
    await this.broker.emit('exchange.identity', 'account.registered', account)
    return account
  }
}