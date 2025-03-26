import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { HttpModule } from '@nestjs/axios'
import { BrokerModule } from '@src/shared/module/broker/broker.module'
import { ConfigService } from '@src/shared/config/service/config.service'
import { ConfigModule } from '@src/shared/config/config.module'
import { IdentityPersistenceModule } from './persist/persist.module'
import { AccountController } from './http/rest/controllers'
import { UserController } from './http/rest/controllers/user.controller'
import { ListAccountService, AccountRegisterService, ListUserService, EditUserInfo } from './core/services'
import { ExternalAuth0Client } from './http/client/integration-auth0.client'


@Module({
	imports: [
		HttpModule,
		BrokerModule.forRoot(),
		IdentityPersistenceModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get('secret_token')
			})
		}),
	],
	providers: [
	 ExternalAuth0Client,
	 AccountRegisterService,
	 EditUserInfo,
	 ListAccountService,
	 ListUserService,
	],
	controllers: [AccountController, UserController]
})
export class IdentityModule {}
