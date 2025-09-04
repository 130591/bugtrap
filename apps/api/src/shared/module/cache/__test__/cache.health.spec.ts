
import { CacheService } from '../core/cache-service'
import { Test, TestingModule } from '@nestjs/testing'
import { CacheHealthIndicator } from '../core/cache.health'

describe('CacheHealthIndicator', () => {
  let healthIndicator: CacheHealthIndicator
  let cacheService: jest.Mocked<CacheService>

  beforeEach(async () => {
    const mockCacheService = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheHealthIndicator,
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile()

    healthIndicator = module.get<CacheHealthIndicator>(CacheHealthIndicator)
    cacheService = module.get(CacheService)
  })

  it('should return healthy status when cache operations succeed', async () => {
    const testValue = { timestamp: Date.now() }
    cacheService.set.mockResolvedValue()
    cacheService.get.mockResolvedValue(testValue)
    cacheService.delete.mockResolvedValue()
    cacheService.getStats.mockResolvedValue({
      redis: { connected: true, memory: 'used_memory:1024' },
      local: { versionMapSize: 5, pendingInvalidations: 0 },
      consistency: { syncRatio: 1.0 },
    })

    const result = await healthIndicator.isHealthy('cache')

    expect(result).toEqual({
      cache: {
        status: 'up',
        redis: true,
        consistency: 1.0,
        memory: 'used_memory:1024',
      },
    })
  })

  it('should throw HealthCheckError when cache operations fail', async () => {
    cacheService.set.mockRejectedValue(new Error('Redis connection failed'))

    await expect(healthIndicator.isHealthy('cache')).rejects.toThrow()
  })

  it('should detect data integrity issues', async () => {
    const testValue = { timestamp: Date.now() }
    cacheService.set.mockResolvedValue()
    cacheService.get.mockResolvedValue({ timestamp: Date.now() + 1000 }) // Valor diferente
    cacheService.delete.mockResolvedValue()

    await expect(healthIndicator.isHealthy('cache')).rejects.toThrow()
  })
})
