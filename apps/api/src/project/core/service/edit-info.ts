import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { ProjectRepository } from '@src/project/persist/repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ForbiddenStatus, ProjectStatus } from '../constants'
import { ProjectEntity } from '@src/project/persist/entities/project.entity'

interface InputEditInfo {
	projectId: string,
	updates: Pick<ProjectEntity, 'description' | 'project_name' | 'priority'>
}

@Injectable()
export class EditInfoService {
	constructor(
		private readonly event: BrokerService,
		private readonly repository: ProjectRepository,
	) {}

	private validate(status: ProjectStatus) {
		if (ForbiddenStatus.includes(status)) {
			throw new ForbiddenException(
				`Unable to change the owner of a project with status'${status}'`,
			)
		}
	}

	@Transactional()
	async execute(command: InputEditInfo) {
		const project = await this.repository.find({ where: { id: command.projectId } })
		if (!project) throw new NotFoundException('Project not found')

		this.validate(project.status)

		const updated = Object.assign(project, command.updates)
		await this.repository.save(updated)
		this.event.emit('project', 'changed.owner', { projectId: project.id })

		return {
			projectId: project.id,
			updated_fields: command.updates,
		}
	}
}
