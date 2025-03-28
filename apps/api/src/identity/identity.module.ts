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
import { ExternalAuth0Client } from './http/integration/integration-auth0.client'
import { ExternalPublicClient } from './http/client/external-public-api'
import { PublicClientModule } from './http/client/public-client.module'


@Module({
	imports: [
		HttpModule,
		BrokerModule.forRoot(),
		IdentityPersistenceModule,
		PublicClientModule,
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
	 ExternalPublicClient,
	 ListAccountService,
	 ListUserService,
	],
	exports: [ExternalPublicClient],
	controllers: [AccountController, UserController]
})
export class IdentityModule {}
