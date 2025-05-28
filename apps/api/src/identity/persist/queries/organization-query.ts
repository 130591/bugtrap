import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BaseQueryService } from '@src/shared/query/base-query.service'
import { Organization } from '../entities/organization.entity'

@Injectable()
export class OrganizationQueryService extends BaseQueryService<Organization> {
  constructor(
    dataSource: DataSource
  ) {
    super(dataSource, Organization)
  }
}