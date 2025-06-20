import { Injectable, UseInterceptors } from '@nestjs/common'
import { LoggingInterceptor } from '@src/shared/framework/interceptors'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ProjectRepository } from '@src/project/persist/repository'
import { ProjectStatus, StatusTransitions } from '../constants'
import { InvalidStatusTransitionException, ProjectNotFoundException } from '../exception'

export interface ChangeStatusCommand {
  status: ProjectStatus
  projectId: string
}

@Injectable()
@UseInterceptors(LoggingInterceptor)
export class ChangeStatusService {
  constructor (
		private readonly repository: ProjectRepository, 
		private readonly broker: BrokerService
	) {}

	private validate (current: ProjectStatus, next: ProjectStatus) {
		if (current === next) return false

		if (next === ProjectStatus.ARCHIVED || current === ProjectStatus.ARCHIVED) {
			return true
		}

		return StatusTransitions[current]?.includes(next) ?? false
	}

	private applyStatusChange (project, newStatus: ProjectStatus) {
		if (!this.validate(project.status, newStatus)) {
      throw new InvalidStatusTransitionException(project.status, newStatus)
    }
    project.status = newStatus
	}

  async execute(command: ChangeStatusCommand): Promise<{ status: string }> {
		let project = await this.repository.find({ where: { id: command.projectId } })
    if (!project) throw new ProjectNotFoundException(command.projectId)
		
    this.applyStatusChange(project, command.status)
    await this.repository.save(project)

    this.broker.emit('project', 'status.changed', {
      projectId: project.id,
      newStatus: project.status,
    })

    return { status: project.status }
	}
}
