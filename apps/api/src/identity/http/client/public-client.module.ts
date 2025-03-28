import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { IdentityPersistenceModule } from '@src/identity/persist/persist.module'
import { ExternalPublicClient } from './external-public-api'
import { ExternalAuth0Client } from '../integration/integration-auth0.client'
import { UserRepository } from '@src/identity/persist/repository'


@Module({
	imports: [IdentityPersistenceModule, HttpModule],
	providers: [ExternalPublicClient, ExternalAuth0Client, UserRepository],
	exports: [ExternalPublicClient, ExternalAuth0Client, UserRepository]
})
export class PublicClientModule {}