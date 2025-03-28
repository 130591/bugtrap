import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BaseQueryService } from '@src/shared/query/base-query.service'
import { Account } from '../entities/account.entity'
import { InjectDataSource } from '@nestjs/typeorm'


@Injectable()
export class AccountQueryService extends BaseQueryService<Account> {
  constructor(
    dataSource: DataSource
  ) {
    super(dataSource, Account)
  }
}