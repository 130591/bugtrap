import { Injectable, NotFoundException } from '@nestjs/common'
import { DefaultTypeOrmRepository } from '@src/shared/lib/persistence/repository/default-type.repository'
import { RefreshToken } from '../entities/refresh-token.entity'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'


@Injectable()
export class TokenRepository extends DefaultTypeOrmRepository<RefreshToken> {
	constructor(
		@InjectDataSource('identity')
		protected readonly dataSource: DataSource
	) {
		super(RefreshToken, dataSource.manager)
	}

	async isRevoked(jti: string): Promise<boolean> {
    const token = await this.find({ where: { id: jti } })

    if (!token) {
      return true
    }

		const now = new Date()
		const isExpired = token.expiresAt <= now
		const isManuallyRevoked = !!token.revokedAt

		return isExpired || isManuallyRevoked
  }

	async revoke(jti: string): Promise<void> {
		const token = await this.find({ where: { id: jti } })
	
		if (!token) {
			throw new NotFoundException(`Refresh token with ID ${jti} not found`)
		}
	
		if (token.revokedAt) {
			return
		}
	
		token.revokedAt = new Date()
		await this.save(token)
	}
}