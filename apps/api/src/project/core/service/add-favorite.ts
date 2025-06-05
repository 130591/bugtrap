import { ConflictException, ForbiddenException, Injectable, NotFoundException, UseInterceptors } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { LoggerService } from '@src/shared/lib/logger'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { LoggingInterceptor } from '@src/shared/framework/interceptors'
import { CommandFavorite } from '@src/project/persist/repository/favorite.repository'
import { FavoriteRepository, ProjectRepository } from '@src/project/persist/repository'
import { ProjectEntity } from '@src/project/persist/entities/project.entity'
import { ForbiddenStatus } from '../constants'
import { InputAddFavorite } from './commands'
import { AddFavoriteLogs } from './logger'


const MAX_FAVORITES_PER_USER = 20

@Injectable()
@UseInterceptors(LoggingInterceptor)
export class AddFavoriteService {
  constructor(
    private readonly logger: LoggerService,
    private readonly event: BrokerService,
    private readonly projectRepository: ProjectRepository,
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  private validateFavoriteEligibility(project: ProjectEntity, userId: string): void {
    if (ForbiddenStatus.includes(project.status)) {
      AddFavoriteLogs.forbiddenStatusFavorite(this.logger, userId, project.id, project.status)
      throw new ForbiddenException("Cannot favorite a finalized project")
    }

    const isMember = project.members?.some((m) => m.user_id === userId)
    const isOwner = project.owner_id === userId

    if (!isMember && !isOwner) {
      AddFavoriteLogs.unauthorizedUserFavoriteAttempt(this.logger, userId, project.id)
      throw new ForbiddenException("Only members or the owner can favorite a project")
    }

    if (project.favorites.length >= MAX_FAVORITES_PER_USER) {
      AddFavoriteLogs.favoriteLimitExceeded(
        this.logger,
        userId,
        project.id,
        project.favorites.length,
        MAX_FAVORITES_PER_USER
      )
      throw new ForbiddenException(`You have reached the maximum of ${MAX_FAVORITES_PER_USER} favorites`)
    }
  }

  private hasBeenFavoritedByUser(project: ProjectEntity, userId: string): boolean {
    return project.favorites.some(
      (favorite) => favorite.userId === userId
    )
  }

  @Transactional()
  async execute(command: InputAddFavorite): Promise<void> {
    const project = await this.projectRepository.find({
      where: { id: command.projectId },
      relations: ['favorites', 'members'],
    })

    if (!project) {
      AddFavoriteLogs.projectNotFound(this.logger, command.userId, command.projectId)
      throw new NotFoundException('Project not found')
    }

    this.validateFavoriteEligibility(project, command.userId)

    if (this.hasBeenFavoritedByUser(project, command.userId)) {
      AddFavoriteLogs.alreadyFavoritedByUser(this.logger, command.userId, project.id)
      throw new ConflictException('Project already favorited by this user')
    }

    const newFavorite: CommandFavorite = {
      projectId: command.projectId,
      userId: command.userId,
      note: command.note,
      context: command.context,
      organizationId: command.organizationId
    }

    await this.favoriteRepository.persist(newFavorite)
    AddFavoriteLogs.favoriteSuccessfullyAdded(
      this.logger,
      command.userId,
      project.id,
      command.note,
      command.context
    )

    await this.event.emit('project', 'add.favorite', { projectId: project.id, userId: command.userId })
    AddFavoriteLogs.favoriteEventDispatched(this.logger, project.id, command.userId)
  }
}