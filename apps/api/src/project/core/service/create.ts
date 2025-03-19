import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DateUtils } from '@src/shared/lib/date-utils/date-utils'
import { CreateProjectRequestDto } from '@src/project/http/rest/dto/request/project.dto'
import { ProjectRepository } from '@src/project/persist/repository'
import { ExternalIdentityClient } from '@src/project/http/client/external-client-identity'
import { PublisherService } from '@src/shared/lib/hive'
import { ProjectEvent } from '@src/shared/event'
import { CreateProjectCommand } from '@src/project/core/contract/command.contract'

const MAX_PROJECTS_FOR_OWNER = 100

@Injectable()
export class CreateService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly event: PublisherService,
    private readonly publicAPI: ExternalIdentityClient,
  ) {}

  async perform(command: CreateProjectRequestDto) {
    await this.validateAccountAndOwner(command)
    await this.validateOwnerProjects(command.ownerId)
    DateUtils.validateProjectDates(command.beginProject)
    return await this.createProject({
      accountId: command.accountId,
      beginProject: command.beginProject,
      description: command.description,
      ownerId: command.ownerId,
      projectName: command.projectName
    })
  }

  private async validateAccountAndOwner(command: CreateProjectRequestDto) {
    const [account, owner] = await Promise.all([
      this.publicAPI.findAccountById(command.accountId),
      this.publicAPI.findUserById(command.ownerId),
    ])

    if (!account || !account.length) {
      throw new NotFoundException('Resource not found')
    }

    if (!owner) {
      throw new NotFoundException('Resource not found')
    }
  }

  private async validateOwnerProjects(ownerId: string) {
    const activeProjectsCount = await this.repository.countActiveProjectsForOwner(ownerId)

    if (activeProjectsCount > MAX_PROJECTS_FOR_OWNER) {
      throw new BadRequestException('Owner cannot have more than 100 active projects')
    }
  }

  private async createProject(command: CreateProjectCommand) {
    const result = await this.repository.persist(command)
    await this.event.emit(ProjectEvent.CREATED, JSON.stringify(command))
    return result
  }
}
 