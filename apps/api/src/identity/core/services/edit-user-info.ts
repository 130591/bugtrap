import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@src/identity/persist/entities/user.entity'
import { UserRepository } from '@src/identity/persist/repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'

interface inputUserInfo {
	userId: string,
	updates: Pick<User, 'firstName' | 'lastName'> & { avatar: string }
}

@Injectable()
export class EditUserInfo {
	constructor(
		private readonly broker: BrokerService,
		private readonly repository: UserRepository,
	) {}

	async execute(command: inputUserInfo) {
		const user  = await this.repository.find({ where: {  id: command.userId }, relations: ['accounts'] })
		if (!user) throw new NotFoundException('Invitation not found or expired')
		const updated = Object.assign(user, command.updates)
		await this.repository.save(updated)
		await this.broker.emit('user', 'user.updated', updated)
	}
}