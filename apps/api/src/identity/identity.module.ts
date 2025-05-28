import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { HttpModule } from '@nestjs/axios'
import { BrokerModule } from '@src/shared/module/broker/broker.module'
import { ConfigService } from '@src/shared/config/service/config.service'
import { ConfigModule } from '@src/shared/config/config.module'
import { IdentityPersistenceModule } from './persist/persist.module'
import { OrganizationController } from './http/rest/controllers'
import { UserController } from './http/rest/controllers/user.controller'
import { ListOrganizationService, OrganizationRegisterService, ListUserService, EditUserInfo, SignIn, RefreshToken, UserRegister } from './core/services'
import { ExternalAuth0Client } from './integration/integration-auth0.client'
import { ExternalPublicClient } from './http/client/external-public-api'
import { PublicClientModule } from './http/client/public-client.module'
import { CacheService } from '@src/shared/module/cache'


@Module({
	imports: [
		BrokerModule.forRoot(),
		HttpModule,
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
	 CacheService,
	 ExternalAuth0Client,
	 OrganizationRegisterService,
	 EditUserInfo,
	 ExternalPublicClient,
	 RefreshToken,
	 ListOrganizationService,
	 ListUserService,
	 UserRegister,
	 SignIn,
	],
	exports: [ExternalPublicClient],
	controllers: [OrganizationController, UserController]
})
export class IdentityModule {}
