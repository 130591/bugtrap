import { Test, TestingModule } from '@nestjs/testing'
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter'
import Redis from 'ioredis'
import { CacheService } from '../core/cache-service'

describe('CacheService Integration Tests', () => {
  let module: TestingModule
  let cacheService: CacheService
  let redis: Redis

  beforeAll(async () => {
    // Usar Redis real para testes de integração
    // Configurar REDIS_URL_TEST na CI/CD
    const redisUrl = process.env.REDIS_URL_TEST || 'redis://localhost:6379/15'
    module = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
      ],
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: () => new Redis(redisUrl),
        },
        {
          provide: CacheService,
          useFactory: (redis: Redis, eventEmitter: EventEmitter2) => {
            return new CacheService(redis, eventEmitter)
          },
          inject: ['REDIS_CLIENT', EventEmitter2],
        },
      ],
    }).compile()
    cacheService = module.get<CacheService>(CacheService)
    redis = module.get('REDIS_CLIENT')
    // Limpa database de teste
    await redis.flushdb()
  })

  afterAll(async () => {
    await redis.flushdb()
    await redis.disconnect()
    await module.close()
  })

  beforeEach(async () => {
    // Limpa cache antes de cada teste
    await redis.flushdb()
  })

  describe('Basic Operations', () => {
    it('should set and get values correctly', async () => {
      const testData = { id: 1, name: 'Test User', email: 'test@example.com' }
      
      await cacheService.set('user:1', testData, { ttl: 60 })
      const result = await cacheService.get('user:1')
      
      expect(result).toEqual(testData)
    })

    it('should handle TTL expiration', async () => {
      const testData = { id: 1, name: 'Test' }
      
      await cacheService.set('user:1', testData, { ttl: 1 }) // 1 segundo
      
      // Aguarda expiração
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      const result = await cacheService.get('user:1')
      expect(result).toBeNull()
    })

    it('should delete keys correctly', async () => {
      const testData = { id: 1, name: 'Test' }
      
      await cacheService.set('user:1', testData)
      await cacheService.delete('user:1')
      
      const result = await cacheService.get('user:1')
      expect(result).toBeNull()
    })
  })

  describe('Tag-based Invalidation', () => {
    it('should invalidate by tags', async () => {
      await cacheService.set('user:1', { name: 'User1' }, { tags: ['user', 'active'] })
      await cacheService.set('user:2', { name: 'User2' }, { tags: ['user', 'inactive'] })
      await cacheService.set('admin:1', { name: 'Admin1' }, { tags: ['admin', 'active'] })

      await cacheService.invalidateByTags(['user'])

      expect(await cacheService.get('user:1')).toBeNull()
      expect(await cacheService.get('user:2')).toBeNull()
      expect(await cacheService.get('admin:1')).not.toBeNull() // Não deve ser afetado
    })

    it('should handle multiple tag invalidation', async () => {
      await cacheService.set('item:1', { type: 'A' }, { tags: ['typeA', 'active'] })
      await cacheService.set('item:2', { type: 'B' }, { tags: ['typeB', 'active'] })
      
      await cacheService.invalidateByTags(['active'])
      
      expect(await cacheService.get('item:1')).toBeNull()
      expect(await cacheService.get('item:2')).toBeNull()
    })
  })

  describe('Batch Operations', () => {
    it('should set multiple values efficiently', async () => {
      const entries: Array<[string, any, any]> = [
        ['user:1', { id: 1, name: 'User1' }, { ttl: 60, tags: ['user'] }],
        ['user:2', { id: 2, name: 'User2' }, { ttl: 60, tags: ['user'] }],
        ['admin:1', { id: 1, name: 'Admin1' }, { ttl: 60, tags: ['admin'] }],
      ]

      await cacheService.setMany(entries)

      const results = await cacheService.getMany(['user:1', 'user:2', 'admin:1'])
      
      expect(results.size).toBe(3)
      expect(results.get('user:1')).toEqual({ id: 1, name: 'User1' })
      expect(results.get('user:2')).toEqual({ id: 2, name: 'User2' })
      expect(results.get('admin:1')).toEqual({ id: 1, name: 'Admin1' })
    })

    it('should get multiple values correctly', async () => {
      await cacheService.set('key1', 'value1')
      await cacheService.set('key2', 'value2')
      await cacheService.set('key3', 'value3')

      const results = await cacheService.getMany(['key1', 'key2', 'nonexistent'])

      expect(results.size).toBe(2)
      expect(results.get('key1')).toBe('value1')
      expect(results.get('key2')).toBe('value2')
      expect(results.has('nonexistent')).toBe(false)
    })
  })

  describe('getOrSet with Lock', () => {
    it('should prevent thundering herd with distributed lock', async () => {
      let factoryCallCount = 0
      const factory = jest.fn().mockImplementation(async () => {
        factoryCallCount++
        await new Promise(resolve => setTimeout(resolve, 100)) // Simula operação lenta
        return { id: 1, computed: true, callCount: factoryCallCount }
      })

      // Executa múltiplas chamadas simultaneamente
      const promises = Array.from({ length: 5 }, () =>
        cacheService.getOrSet('expensive:operation', factory, { ttl: 60 })
      )

      const results = await Promise.all(promises)

      // Todos devem retornar o mesmo valor
      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result).toEqual(results[0])
      })

      // Factory deve ser chamado apenas uma vez
      expect(factoryCallCount).toBe(1)
    })

    it('should handle factory errors correctly', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null)
      jest.spyOn(redis, 'set').mockResolvedValue('OK')

      const factory = jest.fn().mockRejectedValue(new Error('Factory error'))

      await expect(
        cacheService.getOrSet('error:key', factory)
      ).rejects.toThrow('Factory error')

      expect(factory).toHaveBeenCalled()
    })
  })

  describe('Auto Refresh', () => {
    it('should trigger background refresh when threshold reached', async () => {
      const oldValue = { version: 1 }
      const newValue = { version: 2 }
      
      // Setup: cache com 90% do TTL consumido
      await cacheService.set('refresh:test', oldValue, { ttl: 60 })
      
      // Simula passagem de tempo modificando metadata diretamente
      const now = Date.now()
      jest.spyOn(redis, 'hmset').mockResolvedValue('OK')
      await redis.hmset('refresh:test:meta', {
        createdAt: (now - 54000).toString(), // 54s atrás (90% de 60s)
        expiresAt: (now + 6000).toString(),  // 6s restantes
      })

      const factory = jest.fn().mockResolvedValue(newValue)
      
      const result = await cacheService.getWithAutoRefresh(
        'refresh:test',
        factory,
        { refreshThreshold: 0.8, ttl: 60 }
      )

      expect(result).toEqual(oldValue) // Retorna valor atual
      
      // Aguarda refresh em background
      await new Promise(resolve => setTimeout(resolve, 200))
      
      expect(factory).toHaveBeenCalled()
    })
  })

  describe('Consistency and Integrity', () => {
    it('should detect and handle data corruption', async () => {
      const testData = { id: 1, name: 'Test' }
      
      await cacheService.set('integrity:test', testData)
      
      // Corrompe o checksum manualmente
      await redis.hset('integrity:test:meta', 'checksum', 'corrupted')
      
      const result = await cacheService.get('integrity:test')
      expect(result).toBeNull()
      
      // Verifica se foi removido
      const exists = await redis.exists('integrity:test')
      expect(exists).toBe(0)
    })

    it('should handle version conflicts', async () => {
      await cacheService.set('version:test', { v: 1 })
      
      // Simula conflito de versão
      cacheService['versionMap'].set('version:test', 'local-v1')
      await redis.hset('cache:versions', 'version:test', 'server-v2')
      
      const synced = await cacheService.forceSync('version:test')
      expect(synced).toBe(true)
    })
  })

  describe('Smart Invalidation', () => {
    it('should perform cascading invalidation', async () => {
      // Setup: cache com relacionamentos
      await cacheService.set('user:1', { name: 'User1' }, { tags: ['user', 'profile'] })
      await cacheService.set('user:1:posts', ['post1', 'post2'], { tags: ['user', 'posts'] })
      await cacheService.set('user:1:followers', ['user2'], { tags: ['user', 'social'] })

      await cacheService.smartInvalidate('user:1*', { cascade: true })

      expect(await cacheService.get('user:1')).toBeNull()
      expect(await cacheService.get('user:1:posts')).toBeNull()
      expect(await cacheService.get('user:1:followers')).toBeNull()
    })

    it('should handle delayed invalidation', async () => {
      await cacheService.set('delayed:test', { data: 'test' })
      
      // Invalidação com delay
      await cacheService.smartInvalidate('delayed:*', { delay: 100 })
      
      // Ainda deve existir imediatamente
      expect(await cacheService.get('delayed:test')).not.toBeNull()
      
      // Após delay, deve ser removido
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(await cacheService.get('delayed:test')).toBeNull()
    })
  })

  describe('Statistics and Monitoring', () => {
    it('should provide accurate statistics', async () => {
      await cacheService.set('stat:1', { data: 'test1' })
      await cacheService.set('stat:2', { data: 'test2' })

      jest.spyOn(redis, 'info').mockResolvedValue('used_memory:1024\nused_memory_human:1.00K')
      jest.spyOn(redis, 'dbsize').mockResolvedValue(10)

      const stats = await cacheService.getStats()

      expect(stats.redis.connected).toBe(true)
      expect(stats.redis.dbSize).toBe(10)
      expect(stats.local.versionMapSize).toBeGreaterThanOrEqual(2)
    })
  })
})