import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { UserRepository } from '@src/identity/persist/repository'
import { ConfigService } from '@src/shared/config/service/config.service'
import { ExternalAuth0Client } from '../integration/integration-auth0.client'

@Injectable()
export class ExternalPublicClient {
	constructor(
		private readonly configService: ConfigService,
		private readonly userRepo: UserRepository,
		private readonly auth0: ExternalAuth0Client,
		// private readonly client: HttpService
	) {}

	async registerUser(email: string): Promise<any> {
		const user = await this.auth0.getUserByAuth0Email(email)
		console.log('user', user)
		return user
	}

	async findUserByEmailAPI(email: string) {
	  return await this.userRepo.find({ where: { email  } })
	}
}
