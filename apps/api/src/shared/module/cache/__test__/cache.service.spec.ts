import { Test, TestingModule } from '@nestjs/testing'
import { EventEmitter2 } from '@nestjs/event-emitter'
import Redis from 'ioredis'
import { CacheService } from '../core/cache-service'

// Mock do Redis
const mockRedis = {
  pipeline: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  hgetall: jest.fn(),
  hmset: jest.fn(),
  expire: jest.fn(),
  sadd: jest.fn(),
  srem: jest.fn(),
  smembers: jest.fn(),
  hset: jest.fn(),
  hdel: jest.fn(),
  keys: jest.fn(),
  dbsize: jest.fn(),
  info: jest.fn(),
  flushdb: jest.fn(),
  publish: jest.fn(),
  subscribe: jest.fn(),
  on: jest.fn(),
  disconnect: jest.fn(),
  duplicate: jest.fn(),
  status: 'ready',
}

// Mock do pipeline
const mockPipeline = {
  hgetall: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  setex: jest.fn().mockReturnThis(),
  hmset: jest.fn().mockReturnThis(),
  expire: jest.fn().mockReturnThis(),
  sadd: jest.fn().mockReturnThis(),
  srem: jest.fn().mockReturnThis(),
  hset: jest.fn().mockReturnThis(),
  del: jest.fn().mockReturnThis(),
  hdel: jest.fn().mockReturnThis(),
  exec: jest.fn(),
}

describe('CacheService', () => {
  let service: CacheService
  let redis: jest.Mocked<Redis>
  let eventEmitter: jest.Mocked<EventEmitter2>

  beforeEach(async () => {
    // Reset mocks
    Object.values(mockRedis).forEach(fn => {
      if (jest.isMockFunction(fn)) {
        fn.mockClear()
      }
    })
    mockPipeline.exec.mockClear()

    // Setup mock returns
    mockRedis.pipeline.mockReturnValue(mockPipeline as any)
    mockRedis.duplicate.mockReturnValue(mockRedis as any)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedis,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
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

    service = module.get<CacheService>(CacheService)
    redis = module.get('REDIS_CLIENT')
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
  })

  describe('get', () => {
    it('should return null when key does not exist', async () => {
      mockPipeline.exec.mockResolvedValue([
        [null, null], // metadata
        [null, null], // value
      ])

      const result = await service.get('nonexistent')
      expect(result).toBeNull()
    })

    it('should return cached value when valid', async () => {
      const testValue = { id: 1, name: 'Test' }
      const now = Date.now()
      const metadata = {
        createdAt: now.toString(),
        expiresAt: (now + 300000).toString(),
        version: 'v1',
        tags: 'user,entity',
        checksum: service['generateChecksum'](JSON.stringify(testValue)),
      }

      mockPipeline.exec.mockResolvedValue([
        [null, metadata],
        [null, JSON.stringify(testValue)],
      ])

      const result = await service.get('test:key')
      expect(result).toEqual(testValue)
    })

    it('should return null and delete when expired', async () => {
      const testValue = { id: 1, name: 'Test' }
      const now = Date.now()
      const metadata = {
        createdAt: (now - 400000).toString(),
        expiresAt: (now - 100000).toString(), // Expirado
        version: 'v1',
        tags: 'user',
        checksum: service['generateChecksum'](JSON.stringify(testValue)),
      }

      mockPipeline.exec.mockResolvedValue([
        [null, metadata],
        [null, JSON.stringify(testValue)],
      ])

      const result = await service.get('expired:key')
      expect(result).toBeNull()
      expect(service.delete).toHaveBeenCalledWith('expired:key')
    })

    it('should return null when checksum fails', async () => {
      const testValue = { id: 1, name: 'Test' }
      const now = Date.now()
      const metadata = {
        createdAt: now.toString(),
        expiresAt: (now + 300000).toString(),
        version: 'v1',
        tags: 'user',
        checksum: 'invalid-checksum',
      }

      mockPipeline.exec.mockResolvedValue([
        [null, metadata],
        [null, JSON.stringify(testValue)],
      ])

      const result = await service.get('corrupted:key')
      expect(result).toBeNull()
    })
  })

  describe('set', () => {
    it('should store value with metadata', async () => {
      mockPipeline.exec.mockResolvedValue([[null, 'OK']])
      redis.publish.mockResolvedValue(1)

      await service.set('test:key', { id: 1, name: 'Test' }, {
        ttl: 600,
        tags: ['user', 'entity'],
      })

      expect(mockPipeline.setex).toHaveBeenCalled()
      expect(mockPipeline.hmset).toHaveBeenCalled()
      expect(mockPipeline.sadd).toHaveBeenCalledTimes(2) // Uma para cada tag
      expect(redis.publish).toHaveBeenCalledWith('cache:changes', expect.any(String))
    })

    it('should handle set errors gracefully', async () => {
      mockPipeline.exec.mockRejectedValue(new Error('Redis error'))

      await expect(
        service.set('test:key', { id: 1 })
      ).rejects.toThrow('Redis error')
    })
  })

  describe('delete', () => {
    it('should remove key and metadata', async () => {
      redis.hgetall.mockResolvedValue({
        tags: 'user,entity',
        version: 'v1',
      })
      mockPipeline.exec.mockResolvedValue([[null, 1]])

      await service.delete('test:key')

      expect(mockPipeline.del).toHaveBeenCalledWith('test:key')
      expect(mockPipeline.del).toHaveBeenCalledWith('test:key:meta')
      expect(mockPipeline.srem).toHaveBeenCalledWith('tag:user', 'test:key')
      expect(mockPipeline.srem).toHaveBeenCalledWith('tag:entity', 'test:key')
    })
  })

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const cachedValue = { id: 1, name: 'Cached' }
      jest.spyOn(service, 'get').mockResolvedValue(cachedValue)

      const factory = jest.fn()
      const result = await service.getOrSet('test:key', factory)

      expect(result).toEqual(cachedValue)
      expect(factory).not.toHaveBeenCalled()
    })

    it('should generate and cache value if not exists', async () => {
      const newValue = { id: 2, name: 'Generated' }
      jest.spyOn(service, 'get').mockResolvedValue(null)
      jest.spyOn(service, 'set').mockResolvedValue()
      redis.set.mockResolvedValue('OK') // Lock acquisition

      const factory = jest.fn().mockResolvedValue(newValue)
      const result = await service.getOrSet('test:key', factory)

      expect(result).toEqual(newValue)
      expect(factory).toHaveBeenCalled()
      expect(service.set).toHaveBeenCalledWith('test:key', newValue, {})
    })

    it('should handle lock contention', async () => {
      const cachedValue = { id: 1, name: 'Cached' }
      jest.spyOn(service, 'get')
        .mockResolvedValueOnce(null) // Primeira tentativa
        .mockResolvedValueOnce(cachedValue) // Após aguardar

      redis.set.mockResolvedValue(null) // Lock não adquirido

      const factory = jest.fn()
      const result = await service.getOrSet('test:key', factory)

      expect(result).toEqual(cachedValue)
      expect(factory).not.toHaveBeenCalled()
    })
  })

  describe('invalidateByTags', () => {
    it('should invalidate all keys with specified tags', async () => {
      redis.smembers.mockImplementation((tag: string) => {
        if (tag === 'tag:user') return Promise.resolve(['user:1', 'user:2'])
        if (tag === 'tag:admin') return Promise.resolve(['user:1', 'admin:1'])
        return Promise.resolve([])
      })

      jest.spyOn(service, 'delete').mockResolvedValue()

      await service.invalidateByTags(['user', 'admin'])

      expect(service.delete).toHaveBeenCalledWith('user:1')
      expect(service.delete).toHaveBeenCalledWith('user:2')
      expect(service.delete).toHaveBeenCalledWith('admin:1')
    })
  })

  describe('getWithAutoRefresh', () => {
    it('should refresh cache when threshold is reached', async () => {
      const oldValue = { id: 1, name: 'Old' }
      const newValue = { id: 1, name: 'New' }
      const now = Date.now()
      
      // Simula cache antigo (90% do TTL)
      redis.hgetall.mockResolvedValue({
        createdAt: (now - 270000).toString(), // 4.5 min atrás
        expiresAt: (now + 30000).toString(),  // Expira em 0.5 min
      })

      jest.spyOn(service, 'get').mockResolvedValue(oldValue)
      jest.spyOn(service, 'set').mockResolvedValue()
      
      const factory = jest.fn().mockResolvedValue(newValue)
      
      const result = await service.getWithAutoRefresh(
        'test:key',
        factory,
        { refreshThreshold: 0.8, ttl: 300 }
      )

      expect(result).toEqual(oldValue) // Retorna valor atual
      
      // Aguarda refresh assíncrono
      await new Promise(resolve => setImmediate(resolve))
      
      expect(factory).toHaveBeenCalled()
      expect(service.set).toHaveBeenCalledWith('test:key', newValue, expect.any(Object))
    })
  })

  describe('getMany', () => {
    it('should return map of valid cached values', async () => {
      const values = [
        { id: 1, name: 'User1' },
        { id: 2, name: 'User2' },
      ]
      
      const now = Date.now()
      const metadata = {
        createdAt: now.toString(),
        expiresAt: (now + 300000).toString(),
        version: 'v1',
        tags: 'user',
      }

      // Mock pipeline results para 2 chaves
      mockPipeline.exec.mockResolvedValue([
        [null, { ...metadata, checksum: service['generateChecksum'](JSON.stringify(values[0])) }],
        [null, JSON.stringify(values[0])],
        [null, { ...metadata, checksum: service['generateChecksum'](JSON.stringify(values[1])) }],
        [null, JSON.stringify(values[1])],
      ])

      const result = await service.getMany(['user:1', 'user:2'])

      expect(result.size).toBe(2)
      expect(result.get('user:1')).toEqual(values[0])
      expect(result.get('user:2')).toEqual(values[1])
    })
  })

  describe('forceSync', () => {
    it('should sync when versions differ', async () => {
      redis.hget.mockResolvedValue('server-v2')
      service['versionMap'].set('test:key', 'local-v1')
      jest.spyOn(service, 'delete').mockResolvedValue()

      const result = await service.forceSync('test:key')

      expect(result).toBe(true)
      expect(service.delete).toHaveBeenCalledWith('test:key')
    })

    it('should not sync when versions match', async () => {
      redis.hget.mockResolvedValue('v1')
      service['versionMap'].set('test:key', 'v1')
      jest.spyOn(service, 'delete').mockResolvedValue()

      const result = await service.forceSync('test:key')

      expect(result).toBe(false)
      expect(service.delete).not.toHaveBeenCalled()
    })
  })
})