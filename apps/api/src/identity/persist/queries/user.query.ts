import { Inject, Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { BaseQueryService } from '@src/shared/query/base-query.service'
import { User } from '../entities/user.entity'


@Injectable()
export class UserQueryService extends BaseQueryService<User> {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository)
  }
}
