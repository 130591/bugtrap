import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import { DefaultTypeOrmRepository } from '@src/shared/lib/persistence/repository/default-type.repository'
import { InjectDataSource } from '@nestjs/typeorm'
import { FavoriteEntity } from '../entities/favorites.entity'

export interface CommandFavorite {
	organizationId: string;
	projectId?: string;
	userId: string;
	context?: string;
	note?: string;
}

@Injectable()
export class FavoriteRepository extends DefaultTypeOrmRepository<FavoriteEntity> {
	constructor(
		@InjectDataSource('project')
		dataSource: DataSource
	) {
		super(FavoriteEntity, dataSource.manager)
	}

	@Transactional()
	async persist(command: CommandFavorite) {
		try {
			const favorites = new FavoriteEntity({ 
				userId: command.userId, 
				context: command.context, 
				note: command.note,
				projectId: command.projectId,
				organizationId: command.organizationId,
			})
		
			return await this.save(favorites)
		} catch (error) {
			Logger.error('Database error:', error)
			throw new InternalServerErrorException('Something wrong happened')
		}
	}
}
