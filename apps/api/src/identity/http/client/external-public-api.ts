import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { UserRepository } from '@src/identity/persist/repository'
import { ConfigService } from '@src/shared/config/service/config.service'

@Injectable()
export class ExternalPublicClient {
	constructor(
		private readonly configService: ConfigService,
		private readonly userRepo: UserRepository,
		private readonly client: HttpService
	) {}
}