import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { User } from '../entities/user.entity'
import { DefaultTypeOrmRepository } from '@src/shared/lib/persistence/repository/default-type.repository'


@Injectable()
export class UserRepository extends DefaultTypeOrmRepository<User> {

	constructor(
		@InjectDataSource('identity')
		private readonly dataSource: DataSource
	) {
		super(User, dataSource.manager)
	}
}