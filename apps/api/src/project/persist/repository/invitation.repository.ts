import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import { DefaultTypeOrmRepository } from '@src/shared/lib/persistence/repository/default-type.repository'
import { InvitationEntity } from '../entities/invite.entity'
import { InjectDataSource } from '@nestjs/typeorm'

interface CommandInvite {
  token: string;
  hostId: string;
  accountId: string;
  projectId?: string;
  guestEmail: string;
  expiresIn: Date;
  role: 'admin' | 'member' | 'viewer'; 
}

@Injectable()
export class InvitationRepository extends DefaultTypeOrmRepository<InvitationEntity> {
	constructor(
		@InjectDataSource('project')
		dataSource: DataSource
	) {
		super(InvitationEntity, dataSource.manager)
	}

	async findInviteByToken(token: string) {
		const invite = await this.findMany({
			where: { token: token } 
		})

		return invite && invite[0]
	}

	async confirmInvitation(invite: InvitationEntity) {
		await this.save(invite)
	}

	@Transactional()
	async persist(command: CommandInvite) {
		try {
			const project = new InvitationEntity({
				invited_user_id: command.hostId,
				role: command.role,
				accepted: false,
				email: command.guestEmail,
				status: 'pending',
				expires_at: command.expiresIn,
				token: command.token,
				account_id: command.accountId,
				project_id: command.projectId,
			})
		
			return await this.save(project)
		} catch (error) {
			Logger.error('Database error:', error)
			throw new InternalServerErrorException('Something wrong happened')
		}
	}
}
