import * as bcrypt from 'bcrypt'
import { randomUUID } from 'node:crypto'
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Transactional } from 'typeorm-transactional'
import { TokenRepository, UserRepository } from '@src/identity/persist/repository'
import { RefreshToken } from '@src/identity/persist/entities/refresh-token.entity'
import { ConfigService } from '@src/shared/config/service/config.service'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { Payload } from './commands'

const TIME_IN_MILLISECONDS =  7 * 24 * 60 * 60 * 1000 // 7 days in ms

@Injectable()
export class SignIn {
  private readonly accessSecret: string
  private readonly refreshSecret: string
  private readonly refreshTTL = TIME_IN_MILLISECONDS

  constructor(
    config: ConfigService,
    private readonly jwt: JwtService,
    private readonly broker: BrokerService,
    private readonly users: UserRepository,
    private readonly tokens: TokenRepository,
  ) {
    this.accessSecret = config.get('secret_token')
    this.refreshSecret = config.get('refresh_secret')
  }

  private generateAccessToken(user: { id: string; email: string }, roles: string[]) {
    return this.jwt.sign(
      { sub: user.id, email: user.email, roles },
      { secret: this.accessSecret, expiresIn: '15m' },
    )
  }

  private async generateAndStoreRefreshToken(userId: string): Promise<string> {
    const jti = randomUUID()
    const token = this.jwt.sign(
      { sub: userId, jti },
      { secret: this.refreshSecret, expiresIn: '7d' },
    );

    const now = new Date()
    await this.tokens.save(new RefreshToken({
      id: jti,
      userId,
      token,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.refreshTTL),
    }))

    return token
  }

  async compare (userPassword: string, dbPassword: string) {
    return await bcrypt.compare(userPassword, dbPassword)
  }

	@Transactional()
  async execute(payload: Payload) {
    const user = await this.users.findByEmail(payload.email)
    if (!user) throw new NotFoundException('User not found')
      
    const isValid = await this.compare(payload.password, user.passwordHash)
    if (!isValid) throw new UnauthorizedException('Invalid password')

    const roles = (await this.users.getUserRoles(user.id)).map(role => role.role)
    const accessToken = this.generateAccessToken(user, roles)
    const refreshToken = await this.generateAndStoreRefreshToken(user.id)

    await this.broker.emit('identity', 'user.signed', {
      userId: user.id,
      email: user.email,
    })

    return {
      userId: user.id,
      accessToken,
      refreshToken,
    }
  }
}
