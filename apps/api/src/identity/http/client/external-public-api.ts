import { randomUUID } from 'node:crypto'
import { BadRequestException, Injectable } from '@nestjs/common'
import { UserRepository } from '@src/identity/persist/repository'
import { UserRegister } from '@src/identity/core/services'

@Injectable()
export class ExternalPublicClient {
	constructor(
		private readonly userRepo: UserRepository,
		private readonly userRegister: UserRegister,
	) {}

	async registerUser(email: string): Promise<{  message: string; userId: string }> {
		const defaultPassword = randomUUID() + `${email}`
		
		if (!defaultPassword) {
			new BadRequestException(`Unable to generate this user: password not generated`)
		}

		const user = await this.userRegister.execute({
			email: email,
			password: defaultPassword
		})
		
		return user
	}

	async findUserByEmailAPI(email: string) {
	  return await this.userRepo.find({ where: { email  } })
	}

	
	async findUserByIdAPI(idUser: string) {
	  return await this.userRepo.find({ where: { id: idUser } })
	}
}
