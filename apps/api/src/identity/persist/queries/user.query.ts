import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm'
import { BaseQueryService } from '@src/shared/query/base-query.service'
import { User } from '../entities/user.entity'


@Injectable()
export class UserQueryService extends BaseQueryService<User> {
  constructor(
    dataSource: DataSource
    ) {
      super(dataSource, User)
    }
}
