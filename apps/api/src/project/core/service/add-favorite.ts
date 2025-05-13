import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { CommandFavorite } from '@src/project/persist/repository/favorite.repository'
import { FavoriteRepository, ProjectRepository } from '@src/project/persist/repository'
import { ProjectEntity } from '@src/project/persist/entities/project.entity'
import { ForbiddenStatus } from '../constants'
import { InputAddFavorite } from './commands'

const MAX_FAVORITES_PER_USER = 20

@Injectable()
export class AddFavoriteService {
	constructor(
		private readonly event: BrokerService,
		private readonly repository: ProjectRepository,
		private readonly favoriteRepository: FavoriteRepository,
	) {}

	private validate(project: ProjectEntity, userId: string) {
		if (ForbiddenStatus.includes(project.status)) {
			throw new ForbiddenException("Cannot favorite a finalized project")
		}

		const isMember = project.members?.some((m) => m.user_id === userId)
		const isOwner = project.owner_id === userId

		if (!isMember && !isOwner) {
			throw new ForbiddenException("Only members or the owner can favorite")
		}

		if (project.favorites.length >= MAX_FAVORITES_PER_USER) {
			throw new ForbiddenException('Too many favorites for this user')
		}
	}

	private hasBeenFavorited(project, userId) {
		return project.favorites.some(
			(favorite) => favorite.userId === userId
		)
	}

	@Transactional()
	async execute(command: InputAddFavorite): Promise<void> {
		const project = await this.repository.find({
			where: { id: command.projectId },
			relations: ['favorites', 'members'],
		})

		if (!project) {
			throw new NotFoundException('Project not found')
		}

		this.validate(project, command.userId)
		
		if (this.hasBeenFavorited(project, command.userId)) {
			throw new ConflictException('Already favorited')
		}

		const newFavorite: CommandFavorite = {
			projectId: command.projectId,
			userId: command.userId,
			note: command.note,
			context: command.context,
			accountId: command.accountId
		}

		await this.favoriteRepository.persist(newFavorite)
		await this.event.emit('project', 'add.favorite', { projectId: project.id })
	}
}
