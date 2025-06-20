import { Injectable, UseInterceptors } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { 
  OwnershipChangeNotAllowedException, 
  ProjectNotFoundException, 
  UserNotFoundException 
} from '../exception'
import { ProjectRepository } from '@src/project/persist/repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { ExternalIdentityClient } from '@src/project/http/client'
import { ProjectEntity } from '@src/project/persist/entities/project.entity'
import { LoggerService } from '@src/shared/lib/logger'
import { LoggingInterceptor } from '@src/shared/framework/interceptors'
import { ForbiddenStatus, ProjectStatus } from '../constants'
import { AddUserAsOwnerCommand } from './commands'
import { AddUserAsOwnerLogs } from './logger'

export interface AddUserAsOwnerDto {
  projectId: string;
  ownerId: string;
  message: string;
}

export interface AddUserAsOwnerDto {
  projectId: string;
  ownerId: string;
  message: string;
}

@Injectable()
@UseInterceptors(LoggingInterceptor)
export class AddUserAsOwnerService {
  constructor(
    private readonly event: BrokerService,
    private readonly logger: LoggerService,
    private readonly projectRepository: ProjectRepository,
    private readonly identityClient: ExternalIdentityClient,
  ) {}

  private ensureStatusAllowsOwnershipChange(status: ProjectStatus): void {
    if (ForbiddenStatus.includes(status)) {
      throw new OwnershipChangeNotAllowedException(status)
    }
  }

  private async ensureUserExists(email: string): Promise<any> {
    const user = await this.identityClient.findUserByEmail(email)
    if (!user) {
      throw new UserNotFoundException()
    }
    return user
  }

  private changeOwnership(project: ProjectEntity, userId: string): void {
    this.ensureStatusAllowsOwnershipChange(project.status)
    project.owner_id = userId
  }

  @Transactional()
  async execute(command: AddUserAsOwnerCommand): Promise<AddUserAsOwnerDto> {
    const requestingUserId = command.userEmail || 'system_initiator'
    const [user, project] = await Promise.all([
      this.ensureUserExists(command.userEmail),
      this.projectRepository.find({ where: { id: command.projectId } })
    ])

    if (!project) {
      throw new ProjectNotFoundException(project.id)
    }

    this.changeOwnership(project, user.id)

    await this.projectRepository.save(project)
    AddUserAsOwnerLogs.ownerUpdated(this.logger, requestingUserId, project, user.id)

    await this.event.emit('project', 'changed.owner', { projectId: project.id, ownerId: user.id })

    return {
      projectId: project.id,
      ownerId: user.id,
      message: 'User added as project owner',
    }
  }
}