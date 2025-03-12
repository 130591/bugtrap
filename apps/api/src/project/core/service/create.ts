import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DateTransform } from '@src/shared/lib/date-compare/date-compare'
import { CreateProjectRequestDto } from '@src/project/http/rest/dto/request/project.dto'
import { ProjectRepository } from '@src/project/persist/repository'
import { ExternalIdentityClient } from '@src/project/http/client/external-client-identity'
import { PublisherService } from '@src/shared/lib/hive'
import { ProjectEvent } from '@src/shared/event'


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
    DateTransform.validateProjectDates(command.beginProject)
    return await this.createProject(command)
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

  private async createProject(command: CreateProjectRequestDto) {
    const result = await this.repository.persist(command)
    await this.event.publish(ProjectEvent.CREATED, JSON.stringify(command))
    return result
  }
}
 