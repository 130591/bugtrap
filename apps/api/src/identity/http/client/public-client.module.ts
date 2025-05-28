import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { IdentityPersistenceModule } from '@src/identity/persist/persist.module'
import { UserRepository } from '@src/identity/persist/repository'
import { ExternalAuth0Client } from '../../integration/integration-auth0.client'
import { ExternalPublicClient } from './external-public-api'

@Module({
	imports: [IdentityPersistenceModule, HttpModule],
	providers: [ExternalPublicClient, ExternalAuth0Client, UserRepository],
	exports: [ExternalPublicClient, ExternalAuth0Client, UserRepository]
})
export class PublicClientModule {}