import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { ProjectRepository } from '@src/project/persist/repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ExternalIdentityClient } from '@src/project/http/client'
import { ProjectEntity } from '@src/project/persist/entities/project.entity'
import { ForbiddenStatus, ProjectStatus } from '../constants'
import { AddUserAsOwnerCommand } from './commands'

export interface AddUserAsOwnerDto {
	projectId: string,
	ownerId: string,
	message: string,
}

@Injectable()
export class AddUserAsOwnerService {
	constructor(
		private readonly event: BrokerService,
		private readonly projectRepository: ProjectRepository,
		private readonly identityClient: ExternalIdentityClient,
	) {}

	private async ensureUserExists(email: string) {
		let user = await this.identityClient.findUserByEmail(email)
		if (!user) {
			throw new NotFoundException('User not exist')
		}
		return user
	}

	private ensureStatusAllowsOwnershipChange(status: ProjectStatus) {
		if (ForbiddenStatus.includes(status)) {
			throw new ConflictException(
				`Unable to change the owner of a project with status '${status}'`
			)
		}
	}

	private changeOwnership(project: ProjectEntity, userId: string) {
		this.ensureStatusAllowsOwnershipChange(project.status)
		project.owner_id = userId
	}

	@Transactional()
	async execute(command: AddUserAsOwnerCommand): Promise<AddUserAsOwnerDto> {
		let [user, project] = await Promise.all([
			this.ensureUserExists(command.userEmail),
			this.projectRepository.find({ where: { id: command.projectId } })
    ])

		if (!project) throw new NotFoundException('Project not found')

		this.changeOwnership(project, user.id)

		await this.projectRepository.save(project)
		await this.event.emit('project', 'changed.owner', { projectId: project.id, ownerId: user.id })

		return {
			projectId: project.id,
			ownerId: user.id,
			message: 'User added as project owner',
		}
	}
}
