import { Injectable, UseInterceptors } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { LoggingInterceptor } from '@src/shared/framework/interceptors'
import { CreateProjectRequestDto } from '@src/project/http/rest/dto/request/project.dto'
import { ProjectRepository } from '@src/project/persist/repository'
import { ExternalIdentityClient } from '@src/project/http/client/external-client-identity'
import { PublisherService } from '@src/shared/lib/hive'
import { ProjectEvent } from '@src/shared/event'
import { OwnerProjectLimitExceededException } from '../exception'
import { ProjectRules as Policy } from './policies'

const MAX_PROJECTS_FOR_OWNER = 100

@Injectable()
@UseInterceptors(LoggingInterceptor)
export class CreateService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly event: PublisherService,
    private readonly publicAPI: ExternalIdentityClient,
  ) {}

  private async checkOwnerCapacity(ownerId: string) {
    const actives = await this.repository.countActiveProjectsForOwner(ownerId)
    if (actives >= MAX_PROJECTS_FOR_OWNER) {
      throw new OwnerProjectLimitExceededException()
    }
  }

  @Transactional()
  async execute(command: CreateProjectRequestDto) {
    const [user, owner, organization] = await Promise.all([
      this.publicAPI.findUserById(command.userId),
      this.publicAPI.findUserById(command.ownerId),
      this.publicAPI.findOrganizationById(command.organizationId)
    ])

    Policy.checkPolicies(user, organization, owner, command.beginProject)
    await this.checkOwnerCapacity(command.ownerId)

    const project = await this.repository.persist({
      organizationId: command.organizationId,
      beginProject: command.beginProject,
      description: command.description,
      ownerId: command.ownerId,
      projectName: command.projectName,
      priority: command.priority,
    })

    await this.event.emit(ProjectEvent.CREATED, JSON.stringify(command))
    return project
  }
}
