import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, UnauthorizedException } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { v4 as uuid } from 'uuid'


import { JwtService } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RefreshToken } from '@src/identity/core/services/refresh-token'
import { TokenRepository, UserRepository } from '@src/identity/persist/repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { User } from '@src/identity/persist/entities/user.entity'
import { RefreshToken as Token } from '@src/identity/persist/entities/refresh-token.entity'

describe('RefreshToken (integration)', () => {
  let app: INestApplication
  let refreshTokenService: RefreshToken
  let dataSource: DataSource
  let userRepo: UserRepository
  let tokenRepo: TokenRepository
  let jwtService: JwtService

  const now = new Date()
  const userId = uuid()
  const email = 'test@example.com'
  const jti = uuid()
  const refreshSecret = 'refresh-secret'
  const accessSecret = 'access-secret'

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Token],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User, Token]),
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              secret_token: accessSecret,
              refresh_secret: refreshSecret,
            }),
          ],
        }),
      ],
      providers: [
        RefreshToken,
        UserRepository,
        TokenRepository,
        JwtService,
        {
          provide: BrokerService,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    refreshTokenService = module.get(RefreshToken)
    userRepo = module.get(UserRepository)
    tokenRepo = module.get(TokenRepository)
    jwtService = module.get(JwtService)
    dataSource = module.get(DataSource)
  })

  afterEach(async () => {
    const entities = dataSource.entityMetadatas
    for (const entity of entities) {
      const repo = dataSource.getRepository(entity.name)
      await repo.clear()
    }
  })

  afterAll(async () => {
    await app.close()
  })

  it('should refresh tokens successfully for a valid refresh token', async () => {
    const user = await userRepo.save(
      new User({ id: userId, email, passwordHash: 'hashed', userRoles: [] })
    )

    const refreshToken = jwtService.sign(
      { sub: userId, jti },
      { secret: refreshSecret, expiresIn: '7d' }
    )

    await tokenRepo.save(
      new Token({
        id: jti,
        userId: user.id,
        token: refreshToken,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      })
    )

    const result = await refreshTokenService.execute({ refreshToken: refreshToken })

    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('refreshToken')
    expect(typeof result.accessToken).toBe('string')
    expect(typeof result.refreshToken).toBe('string')

    const revoked = await tokenRepo.find({ where: { id: jti } })
    expect(revoked?.revokedAt).toBeDefined()

    const newToken = await tokenRepo.find({ where: { userId: userId } })
    expect(newToken).not.toBeNull()
    expect(newToken?.userId).toBe(userId)
  })

  it('should throw if refresh token is expired or invalid', async () => {
    const invalidToken = 'invalid.token.string'

    await expect(
      refreshTokenService.execute({ refreshToken: invalidToken }),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should throw if token is revoked', async () => {
    const revokedJti = uuid()
    const token = jwtService.sign({ sub: userId, jti: revokedJti }, { secret: refreshSecret })

    await tokenRepo.save(
      new Token({
        id: revokedJti,
        userId,
        token,
        revokedAt: new Date(),
        createdAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      })
    )

    await expect(
      refreshTokenService.execute({ refreshToken: token }),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should throw if user does not exist', async () => {
    const fakeUserId = uuid()
    const jti = uuid()
    const token = jwtService.sign({ sub: fakeUserId, jti }, { secret: refreshSecret })

    await tokenRepo.save(
      new Token({
        id: jti,
        userId: fakeUserId,
        token,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      })
    )

    await expect(
      refreshTokenService.execute({ refreshToken: token }),
    ).rejects.toThrow(UnauthorizedException)
  })
})
