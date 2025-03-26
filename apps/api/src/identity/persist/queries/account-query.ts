import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { BaseQueryService } from '@src/shared/query/base-query.service'
import { Account } from '../entities/account.entity'


@Injectable()
export class AccountQueryService extends BaseQueryService<Account> {
  constructor(
    private readonly accountRepository: Repository<Account>,
  ) {
    super(accountRepository)
  }
}