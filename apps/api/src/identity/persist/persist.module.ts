import { Module } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { TypeOrmPersistenceModule } from '@src/shared/lib/persistence/typeorm-persistence.module'
import { ConfigModule } from '@src/shared/config/config.module'
import { ConfigService } from '@src/shared/config/service/config.service'
import { UserRepository } from './repository'
import getDataSource, { dataSourceOptionsFactory } from './typeorm-datasource'
import { AccountRepository } from './repository/account.repository'
import { AccountQueryService, UserQueryService } from './queries'
import { Account } from './entities/account.entity'
import { User } from './entities/user.entity'


const USER_QUERY_PROVIDERS = [
	{
		provide: 'DATA_SOURCE',
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
			return dataSource.getRepository(User)
		},
		inject: ['DATA_SOURCE'],
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
      provide: Repository<Account>,
      useClass: AccountRepository,
    },
    {
      provide: AccountQueryService,
      useFactory: (accountRepository: Repository<Account>) => {
        return new AccountQueryService(accountRepository)
      },
      inject: [Repository<Account>],
    },
		UserRepository,
		...USER_QUERY_PROVIDERS
	],
	exports: [
		UserRepository,
		AccountRepository,
    AccountQueryService,
		UserQueryService
	],
})
export class IdentityPersistenceModule {}