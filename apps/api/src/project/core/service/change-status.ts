import { ConflictException , Injectable, NotFoundException } from '@nestjs/common'
import { ProjectRepository } from '@src/project/persist/repository'
import { ProjectStatus } from '../constants'
import { PublisherService } from '@src/shared/lib/hive'

export interface ChangeStatusCommand {
  status: ProjectStatus
  projectId: string
}

@Injectable()
export class ChangeStatusService {
  constructor (private readonly repository: ProjectRepository, private readonly event: PublisherService) {}

  async execute(command: ChangeStatusCommand) {
		const project = await this.repository.find({ where: { id: command.projectId } })

		if (!project) throw new NotFoundException(`Project with ID ${command.projectId} not found`)

		if ([ProjectStatus.CANCELED, ProjectStatus.COMPLETED, ProjectStatus.ARCHIVED].includes(project.status)) {
			throw new ConflictException(`The status can't be changed to ${command.status} at this moment`)
		}

		project.status = command.status
		
		await this.repository.save(project)
		this.event.emit('project.status.changed', { projectId: project.id, status: project.status })
		return { status: project.status }
	}
}