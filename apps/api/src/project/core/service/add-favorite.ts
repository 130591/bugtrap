import { ConflictException, Injectable, UseInterceptors } from '@nestjs/common'
import { 
  FavoriteNotAllowedException, 
  MaxFavoritesReachedException, 
  OnlyMembersOrOwnerCanFavoriteException, 
  ProjectNotFoundException
} from '../exception'
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
      throw new FavoriteNotAllowedException()
    }

    const isMember = project.members?.some((m) => m.user_id === userId)
    const isOwner = project.owner_id === userId

    if (!isMember && !isOwner) {
      throw new OnlyMembersOrOwnerCanFavoriteException()
    }

    if (project.favorites.length >= MAX_FAVORITES_PER_USER) {
      AddFavoriteLogs.favoriteLimitExceeded(
        this.logger,
        userId,
        project.id,
        project.favorites.length,
        MAX_FAVORITES_PER_USER
      )
      throw new MaxFavoritesReachedException(MAX_FAVORITES_PER_USER)
    }
  }

  private hasBeenFavoritedByUser(project: ProjectEntity, userId: string): boolean {
    return project.favorites.some(
      (favorite) => favorite.userId === userId
    )
  }

  @Transactional()
  async execute(command: InputAddFavorite): Promise<void> {
    const project = await this.projectRepository.getProjectAndMembers(command.projectId)

    if (!project) {
      throw new ProjectNotFoundException(project.id)
    }

    this.validateFavoriteEligibility(project, command.userId)

    if (this.hasBeenFavoritedByUser(project, command.userId)) {
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
  }
}