import { Injectable, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm'
import { DefaultTypeOrmRepository } from '@src/shared/lib/persistence/repository/default-type.repository'
import { RegisterAccountCommand } from '@src/identity/core/services/organization-register'
import { Organization } from '../entities/organization.entity'

export interface RegisterAccountWithStatus extends RegisterAccountCommand {
  status: string,
	email: string,
	name: string,
	firstName: string,
	lastName: string
}

@Injectable()
export class OrganizationRepository extends DefaultTypeOrmRepository<Organization> {

	constructor(
		@InjectDataSource('identity')
		protected readonly dataSource: DataSource
	) {
		super(Organization, dataSource.manager)
	}
}
