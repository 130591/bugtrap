import { Module } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { TypeOrmPersistenceModule } from '@src/shared/lib/persistence/typeorm-persistence.module'
import { ConfigModule } from '@src/shared/config/config.module'
import { ConfigService } from '@src/shared/config/service/config.service'
import { TokenRepository, UserRepository } from './repository'
import getDataSource from './typeorm-datasource'
import { dataSourceOptionsFactory } from './typeorm-datasource.factory'
import { OrganizationRepository } from './repository/organization.repository'
import { OrganizationQueryService, UserQueryService } from './queries'
import { User } from './entities/user.entity'


const USER_QUERY_PROVIDERS = [
  {
    provide: DataSource,
    useFactory: async () => {
      const dataSource = await getDataSource
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

const TOKEN_QUERY_PROVIDERS = [
  {
    provide: DataSource,
    useFactory: async () => {
      const dataSource = await getDataSource
      if (!dataSource.isInitialized) {
        await dataSource.initialize()
      }
      return dataSource
    },
  },
  {
    provide: 'TOKEN_REPOSITORY',
    useFactory: async (dataSource: DataSource) => {
      return dataSource.getRepository(TokenRepository)
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
    OrganizationRepository,
    {
      provide: OrganizationQueryService,
      useFactory: (dataSource: DataSource) => {
        return new OrganizationQueryService(dataSource)
      },
      inject: [DataSource],
    },
    UserRepository,
    ...USER_QUERY_PROVIDERS,
    TokenRepository,
    ...TOKEN_QUERY_PROVIDERS
  ],
  exports: [
    UserRepository,
    TokenRepository,
    OrganizationRepository,
    OrganizationQueryService,
    UserQueryService,
  ],
})
export class IdentityPersistenceModule {}