import { randomUUID } from 'node:crypto'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Transactional } from 'typeorm-transactional'
import { ConfigService } from '@src/shared/config/service/config.service'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { TokenRepository, UserRepository } from '@src/identity/persist/repository'
import { RefreshToken as Entity } from '../../persist/entities/refresh-token.entity'


@Injectable()
export class RefreshToken {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly broker: BrokerService,
    private readonly userRepo: UserRepository,
    private readonly tokenRepo: TokenRepository,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.accessSecret = config.get('secret_token')
    this.refreshSecret = config.get('refresh_secret')
  }

  private verifyToken(token: string) {
    try {
      return this.jwt.verify(token, { secret: this.refreshSecret })
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }

  private async ensureTokenNotRevoked(jti: string) {
    const isRevoked = await this.tokenRepo.isRevoked(jti)
    if (isRevoked) {
      throw new UnauthorizedException('Refresh token revoked')
    }
  }

  private async getUser(userId: string) {
    const user = await this.userRepo.find({ where: { id: userId } })
    if (!user) {
      throw new UnauthorizedException('User not found')
    }
    return user
  }

  private generateAccessToken(userId: string, email: string, roles: string[]) {
    return this.jwt.sign(
      { sub: userId, email, roles },
      { secret: this.accessSecret, expiresIn: '15m' },
    )
  }

  private async generateAndPersistRefreshToken(userId: string, oldJti: string) {
    const newJti = randomUUID()
    const expiresInMs = 7 * 24 * 60 * 60 * 1000;
    const now = new Date()

    const token = this.jwt.sign(
      { sub: userId, jti: newJti },
      { secret: this.refreshSecret, expiresIn: '7d' },
    )

    await this.tokenRepo.revoke(oldJti)

    const refreshToken = new Entity({
      id: newJti,
      userId,
      token,
      createdAt: now,
      expiresAt: new Date(now.getTime() + expiresInMs),
    })

    await this.tokenRepo.save(refreshToken)
    return refreshToken
  }

	@Transactional()
	async execute({ refreshToken }: { refreshToken: string }) {
    const payload = this.verifyToken(refreshToken)
    const { sub: userId, jti } = payload

    await this.ensureTokenNotRevoked(jti)

    const user = await this.getUser(userId)
    const roles = (await this.userRepo.getUserRoles(user.id)).map(role => role.role)
    const accessToken = this.generateAccessToken(userId, user.email, roles)
    const newRefresh = await this.generateAndPersistRefreshToken(userId, jti)

    await this.broker.emit('identity', 'user.refreshed', { userId, email: user.email })

    return {
      accessToken,
      userId: userId,
      refreshToken: newRefresh.token,
    }
  }
}