import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm'
import { Transactional } from 'typeorm-transactional'
import { DefaultTypeOrmRepository } from '@src/shared/lib/persistence/repository/default-type.repository'
import { RegisterAccountCommand } from '@src/identity/core/services/account-register'
import { Account } from '../entities/account.entity'
import { User } from '../entities/user.entity'

export interface RegisterAccountWithStatus extends RegisterAccountCommand {
  status: string,
	email: string,
	name: string,
	userId: string,
	firstName: string,
	lastName: string
}

@Injectable()
export class AccountRepository extends DefaultTypeOrmRepository<Account> {

	constructor(
		@InjectDataSource('identity')
		private readonly dataSource: DataSource
	) {
		super(Account, dataSource.manager)
	}

	@Transactional()
	async persist(command: RegisterAccountWithStatus) {
		try {
			const newUser = new User({ 
			  auth0Id: command.userId, 
				email: command.email, 
				firstName: command.firstName, 
				lastName: command.lastName 
			})

			const newAccount = new Account({
				email: command.email,
				accountName: command.name,
				status: command.status as any,
				users: [newUser]
			})

			return await this.save(newAccount)
		} catch (error) {
			Logger.error('Database error:', error)
			throw new InternalServerErrorException('Something wrong happened')
		}
	}
}
