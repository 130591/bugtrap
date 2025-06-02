import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { BrokerModule } from '@src/shared/module/broker/broker.module'
import { IdentityPersistenceModule } from '@src/identity/persist/persist.module'
import { UserRepository } from '@src/identity/persist/repository'
import { UserRegister } from '@src/identity/core/services'
import { ExternalAuth0Client } from '../../integration/integration-auth0.client'
import { ExternalPublicClient } from './external-public-api'

@Module({
	imports: [
		IdentityPersistenceModule, 
		HttpModule, 
		BrokerModule.forRoot()
	],
	providers: [
		ExternalPublicClient, 
		ExternalAuth0Client, 
		UserRepository, 
		UserRegister
	],
	exports: [
		ExternalPublicClient, 
		ExternalAuth0Client, 
		UserRepository, 
		UserRegister
	]
})
export class PublicClientModule {}