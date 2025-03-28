import { Module } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { TypeOrmPersistenceModule } from '@src/shared/lib/persistence/typeorm-persistence.module'
import { ConfigModule } from '@src/shared/config/config.module'
import { ConfigService } from '@src/shared/config/service/config.service'
import { UserRepository } from './repository'
import getDataSource, { dataSourceOptionsFactory } from './typeorm-datasource'
import { AccountRepository } from './repository/account.repository'
import { AccountQueryService, UserQueryService } from './queries'
import { User } from './entities/user.entity'


const USER_QUERY_PROVIDERS = [
  {
    provide: DataSource,
    useFactory: async () => {
      const dataSource = await getDataSource()
      if (!dataSource.isInitialized) {
        await dataSource.initialize()
      }
      return dataSource
    },
  },
  {
    provide: 'USER_REPOSITORY',
    useFactory: async (dataSource: DataSource) => {
      return dataSource.getRepository(User);
    },
    inject: [DataSource],
  },
  UserQueryService,
]


@Module({
  imports: [
    TypeOrmPersistenceModule.forRoot({
      name: 'identity',
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return dataSourceOptionsFactory(configService)
      },
    }),
  ],
  providers: [
    AccountRepository,
    {
      provide: AccountQueryService,
      useFactory: (dataSource: DataSource) => {
        return new AccountQueryService(dataSource)
      },
      inject: [DataSource],
    },
    UserRepository,
    ...USER_QUERY_PROVIDERS,
  ],
  exports: [
    UserRepository,
    AccountRepository,
    AccountQueryService,
    UserQueryService,
  ],
})
export class IdentityPersistenceModule {}