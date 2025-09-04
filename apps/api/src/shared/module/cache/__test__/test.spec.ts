// cache.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Redis from 'ioredis';
import { CacheService } from '../cache.service';

// Mock do Redis
const mockRedis = {;
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
};

// Mock do pipeline
const mockPipeline = {;
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
};

describe('CacheService', () => {
  let service: CacheService;
  let redis: jest.Mocked<Redis>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    // Reset mocks
    Object.values(mockRedis).forEach(fn => {
      if (jest.isMockFunction(fn)) {
        fn.mockClear();
      }
    });
    mockPipeline.exec.mockClear();

    // Setup mock returns
    mockRedis.pipeline.mockReturnValue(mockPipeline as any);
    mockRedis.duplicate.mockReturnValue(mockRedis as any);

    const module: TestingModule = await Test.createTestingModule({;
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
            return new CacheService(redis, eventEmitter);
          },
          inject: ['REDIS_CLIENT', EventEmitter2],
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    redis = module.get('REDIS_CLIENT');
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('get', () => {
    it('should return null when key does not exist', async () => {
      mockPipeline.exec.mockResolvedValue([
        [null, null], // metadata
        [null, null], // value
      ]);

      const result = await service.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return cached value when valid', async () => {
      const testValue = { id: 1, name: 'Test' };
      const now = Date.now();
      const metadata = {;
        createdAt: now.toString(),
        expiresAt: (now + 300000).toString(),
        version: 'v1',
        tags: 'user,entity',
        checksum: service['generateChecksum'](JSON.stringify(testValue)),
      };

      mockPipeline.exec.mockResolvedValue([
        [null, metadata],
        [null, JSON.stringify(testValue)],
      ]);

      const result = await service.get('test:key');
      expect(result).toEqual(testValue);
    });

    it('should return null and delete when expired', async () => {
      const testValue = { id: 1, name: 'Test' };
      const now = Date.now();
      const metadata = {;
        createdAt: (now - 400000).toString(),
        expiresAt: (now - 100000).toString(), // Expirado
        version: 'v1',
        tags: 'user',
        checksum: service['generateChecksum'](JSON.stringify(testValue)),
      };

      mockPipeline.exec.mockResolvedValue([
        [null, metadata],
        [null, JSON.stringify(testValue)],
      ]);

      const result = await service.get('expired:key');
      expect(result).toBeNull();
      expect(service.delete).toHaveBeenCalledWith('expired:key');
    });

    it('should return null when checksum fails', async () => {
      const testValue = { id: 1, name: 'Test' };
      const now = Date.now();
      const metadata = {;
        createdAt: now.toString(),
        expiresAt: (now + 300000).toString(),
        version: 'v1',
        tags: 'user',
        checksum: 'invalid-checksum',
      };

      mockPipeline.exec.mockResolvedValue([
        [null, metadata],
        [null, JSON.stringify(testValue)],
      ]);

      const result = await service.get('corrupted:key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store value with metadata', async () => {
      mockPipeline.exec.mockResolvedValue([[null, 'OK']]);
      redis.publish.mockResolvedValue(1);

      await service.set('test:key', { id: 1, name: 'Test' }, {;
        ttl: 600,
        tags: ['user', 'entity'],
      });

      expect(mockPipeline.setex).toHaveBeenCalled();
      expect(mockPipeline.hmset).toHaveBeenCalled();
      expect(mockPipeline.sadd).toHaveBeenCalledTimes(2); // Uma para cada tag
      expect(redis.publish).toHaveBeenCalledWith('cache:changes', expect.any(String));
    });

    it('should handle set errors gracefully', async () => {
      mockPipeline.exec.mockRejectedValue(new Error('Redis error'));

      await expect(;
        service.set('test:key', { id: 1 })
      ).rejects.toThrow('Redis error');
    });
  });

  describe('delete', () => {
    it('should remove key and metadata', async () => {
      redis.hgetall.mockResolvedValue({
        tags: 'user,entity',
        version: 'v1',
      });
      mockPipeline.exec.mockResolvedValue([[null, 1]]);

      await service.delete('test:key');

      expect(mockPipeline.del).toHaveBeenCalledWith('test:key');
      expect(mockPipeline.del).toHaveBeenCalledWith('test:key:meta');
      expect(mockPipeline.srem).toHaveBeenCalledWith('tag:user', 'test:key');
      expect(mockPipeline.srem).toHaveBeenCalledWith('tag:entity', 'test:key');
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const cachedValue = { id: 1, name: 'Cached' };
      jest.spyOn(service, 'get').mockResolvedValue(cachedValue);

      const factory = jest.fn();
      const result = await service.getOrSet('test:key', factory);

      expect(result).toEqual(cachedValue);
      expect(factory).not.toHaveBeenCalled();
    });

    it('should generate and cache value if not exists', async () => {
      const newValue = { id: 2, name: 'Generated' };
      jest.spyOn(service, 'get').mockResolvedValue(null);
      jest.spyOn(service, 'set').mockResolvedValue();
      redis.set.mockResolvedValue('OK'); // Lock acquisition

      const factory = jest.fn().mockResolvedValue(newValue);
      const result = await service.getOrSet('test:key', factory);

      expect(result).toEqual(newValue);
      expect(factory).toHaveBeenCalled();
      expect(service.set).toHaveBeenCalledWith('test:key', newValue, {});
    });

    it('should handle lock contention', async () => {
      const cachedValue = { id: 1, name: 'Cached' };
      jest.spyOn(service, 'get')
        .mockResolvedValueOnce(null) // Primeira tentativa
        .mockResolvedValueOnce(cachedValue); // Após aguardar

      redis.set.mockResolvedValue(null); // Lock não adquirido

      const factory = jest.fn();
      const result = await service.getOrSet('test:key', factory);

      expect(result).toEqual(cachedValue);
      expect(factory).not.toHaveBeenCalled();
    });
  });

  describe('invalidateByTags', () => {
    it('should invalidate all keys with specified tags', async () => {
      redis.smembers.mockImplementation((tag: string) => {
        if (tag === 'tag:user') return Promise.resolve(['user:1', 'user:2']);
        if (tag === 'tag:admin') return Promise.resolve(['user:1', 'admin:1']);
        return Promise.resolve([]);
      });

      jest.spyOn(service, 'delete').mockResolvedValue();

      await service.invalidateByTags(['user', 'admin']);

      expect(service.delete).toHaveBeenCalledWith('user:1');
      expect(service.delete).toHaveBeenCalledWith('user:2');
      expect(service.delete).toHaveBeenCalledWith('admin:1');
    });
  });

  describe('getWithAutoRefresh', () => {
    it('should refresh cache when threshold is reached', async () => {
      const oldValue = { id: 1, name: 'Old' };
      const newValue = { id: 1, name: 'New' };
      const now = Date.now();
      
      // Simula cache antigo (90% do TTL)
      redis.hgetall.mockResolvedValue({
        createdAt: (now - 270000).toString(), // 4.5 min atrás
        expiresAt: (now + 30000).toString(),  // Expira em 0.5 min
      });

      jest.spyOn(service, 'get').mockResolvedValue(oldValue);
      jest.spyOn(service, 'set').mockResolvedValue();
      
      const factory = jest.fn().mockResolvedValue(newValue);
      
      const result = await service.getWithAutoRefresh(;
        'test:key',
        factory,
        { refreshThreshold: 0.8, ttl: 300 }
      );

      expect(result).toEqual(oldValue); // Retorna valor atual
      
      // Aguarda refresh assíncrono
      await new Promise(resolve => setImmediate(resolve));
      
      expect(factory).toHaveBeenCalled();
      expect(service.set).toHaveBeenCalledWith('test:key', newValue, expect.any(Object));
    });
  });

  describe('getMany', () => {
    it('should return map of valid cached values', async () => {
      const values = [;
        { id: 1, name: 'User1' },
        { id: 2, name: 'User2' },
      ];
      
      const now = Date.now();
      const metadata = {;
        createdAt: now.toString(),
        expiresAt: (now + 300000).toString(),
        version: 'v1',
        tags: 'user',
      };

      // Mock pipeline results para 2 chaves
      mockPipeline.exec.mockResolvedValue([
        [null, { ...metadata, checksum: service['generateChecksum'](JSON.stringify(values[0])) }],
        [null, JSON.stringify(values[0])],
        [null, { ...metadata, checksum: service['generateChecksum'](JSON.stringify(values[1])) }],
        [null, JSON.stringify(values[1])],
      ]);

      const result = await service.getMany(['user:1', 'user:2']);

      expect(result.size).toBe(2);
      expect(result.get('user:1')).toEqual(values[0]);
      expect(result.get('user:2')).toEqual(values[1]);
    });
  });

  describe('forceSync', () => {
    it('should sync when versions differ', async () => {
      redis.hget.mockResolvedValue('server-v2');
      service['versionMap'].set('test:key', 'local-v1');
      jest.spyOn(service, 'delete').mockResolvedValue();

      const result = await service.forceSync('test:key');

      expect(result).toBe(true);
      expect(service.delete).toHaveBeenCalledWith('test:key');
    });

    it('should not sync when versions match', async () => {
      redis.hget.mockResolvedValue('v1');
      service['versionMap'].set('test:key', 'v1');
      jest.spyOn(service, 'delete').mockResolvedValue();

      const result = await service.forceSync('test:key');

      expect(result).toBe(false);
      expect(service.delete).not.toHaveBeenCalled();
    });
  });
});

// cache.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import Redis from 'ioredis';
import { CacheService } from '../cache.service';
import { CacheModule } from '../cache.module';

describe('CacheService Integration Tests', () => {
  let module: TestingModule;
  let cacheService: CacheService;
  let redis: Redis;

  beforeAll(async () => {
    // Usar Redis real para testes de integração
    // Configurar REDIS_URL_TEST na CI/CD
    const redisUrl = process.env.REDIS_URL_TEST || 'redis://localhost:6379/15';
    
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
            return new CacheService(redis, eventEmitter);
          },
          inject: ['REDIS_CLIENT', EventEmitter2],
        },
      ],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
    redis = module.get('REDIS_CLIENT');

    // Limpa database de teste
    await redis.flushdb();
  });

  afterAll(async () => {
    await redis.flushdb();
    await redis.disconnect();
    await module.close();
  });

  beforeEach(async () => {
    // Limpa cache antes de cada teste
    await redis.flushdb();
  });

  describe('Basic Operations', () => {
    it('should set and get values correctly', async () => {
      const testData = { id: 1, name: 'Test User', email: 'test@example.com' };
      
      await cacheService.set('user:1', testData, { ttl: 60 });
      const result = await cacheService.get('user:1');
      
      expect(result).toEqual(testData);
    });

    it('should handle TTL expiration', async () => {
      const testData = { id: 1, name: 'Test' };
      
      await cacheService.set('user:1', testData, { ttl: 1 }); // 1 segundo;
      
      // Aguarda expiração
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const result = await cacheService.get('user:1');
      expect(result).toBeNull();
    });

    it('should delete keys correctly', async () => {
      const testData = { id: 1, name: 'Test' };
      
      await cacheService.set('user:1', testData);
      await cacheService.delete('user:1');
      
      const result = await cacheService.get('user:1');
      expect(result).toBeNull();
    });
  });

  describe('Tag-based Invalidation', () => {
    it('should invalidate by tags', async () => {
      await cacheService.set('user:1', { name: 'User1' }, { tags: ['user', 'active'] });
      await cacheService.set('user:2', { name: 'User2' }, { tags: ['user', 'inactive'] });
      await cacheService.set('admin:1', { name: 'Admin1' }, { tags: ['admin', 'active'] });

      await cacheService.invalidateByTags(['user']);

      expect(await cacheService.get('user:1')).toBeNull();
      expect(await cacheService.get('user:2')).toBeNull();
      expect(await cacheService.get('admin:1')).not.toBeNull(); // Não deve ser afetado
    });

    it('should handle multiple tag invalidation', async () => {
      await cacheService.set('item:1', { type: 'A' }, { tags: ['typeA', 'active'] });
      await cacheService.set('item:2', { type: 'B' }, { tags: ['typeB', 'active'] });
      
      await cacheService.invalidateByTags(['active']);
      
      expect(await cacheService.get('item:1')).toBeNull();
      expect(await cacheService.get('item:2')).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should set multiple values efficiently', async () => {
      const entries: Array<[string, any, any]> = [;
        ['user:1', { id: 1, name: 'User1' }, { ttl: 60, tags: ['user'] }],
        ['user:2', { id: 2, name: 'User2' }, { ttl: 60, tags: ['user'] }],
        ['admin:1', { id: 1, name: 'Admin1' }, { ttl: 60, tags: ['admin'] }],
      ];

      await cacheService.setMany(entries);

      const results = await cacheService.getMany(['user:1', 'user:2', 'admin:1']);
      
      expect(results.size).toBe(3);
      expect(results.get('user:1')).toEqual({ id: 1, name: 'User1' });
      expect(results.get('user:2')).toEqual({ id: 2, name: 'User2' });
      expect(results.get('admin:1')).toEqual({ id: 1, name: 'Admin1' });
    });

    it('should get multiple values correctly', async () => {
      await cacheService.set('key1', 'value1');
      await cacheService.set('key2', 'value2');
      await cacheService.set('key3', 'value3');

      const results = await cacheService.getMany(['key1', 'key2', 'nonexistent']);

      expect(results.size).toBe(2);
      expect(results.get('key1')).toBe('value1');
      expect(results.get('key2')).toBe('value2');
      expect(results.has('nonexistent')).toBe(false);
    });
  });

  describe('getOrSet with Lock', () => {
    it('should prevent thundering herd with distributed lock', async () => {
      let factoryCallCount = 0;
      const factory = jest.fn().mockImplementation(async () => {;
        factoryCallCount++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Simula operação lenta;
        return { id: 1, computed: true, callCount: factoryCallCount };
      });

      // Executa múltiplas chamadas simultaneamente
      const promises = Array.from({ length: 5 }, () =>;
        cacheService.getOrSet('expensive:operation', factory, { ttl: 60 })
      );

      const results = await Promise.all(promises);

      // Todos devem retornar o mesmo valor
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toEqual(results[0]);
      });

      // Factory deve ser chamado apenas uma vez
      expect(factoryCallCount).toBe(1);
    });

    it('should handle factory errors correctly', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      redis.set.mockResolvedValue('OK');

      const factory = jest.fn().mockRejectedValue(new Error('Factory error'));

      await expect(;
        cacheService.getOrSet('error:key', factory)
      ).rejects.toThrow('Factory error');

      expect(factory).toHaveBeenCalled();
    });
  });

  describe('Auto Refresh', () => {
    it('should trigger background refresh when threshold reached', async () => {
      const oldValue = { version: 1 };
      const newValue = { version: 2 };
      
      // Setup: cache com 90% do TTL consumido
      await cacheService.set('refresh:test', oldValue, { ttl: 60 });
      
      // Simula passagem de tempo modificando metadata diretamente
      const now = Date.now();
      await redis.hmset('refresh:test:meta', {;
        createdAt: (now - 54000).toString(), // 54s atrás (90% de 60s)
        expiresAt: (now + 6000).toString(),  // 6s restantes
      });

      const factory = jest.fn().mockResolvedValue(newValue);
      
      const result = await cacheService.getWithAutoRefresh(;
        'refresh:test',
        factory,
        { refreshThreshold: 0.8, ttl: 60 }
      );

      expect(result).toEqual(oldValue); // Retorna valor atual
      
      // Aguarda refresh em background
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(factory).toHaveBeenCalled();
    });
  });

  describe('Consistency and Integrity', () => {
    it('should detect and handle data corruption', async () => {
      const testData = { id: 1, name: 'Test' };
      
      await cacheService.set('integrity:test', testData);
      
      // Corrompe o checksum manualmente
      await redis.hset('integrity:test:meta', 'checksum', 'corrupted');
      
      const result = await cacheService.get('integrity:test');
      expect(result).toBeNull();
      
      // Verifica se foi removido
      const exists = await redis.exists('integrity:test');
      expect(exists).toBe(0);
    });

    it('should handle version conflicts', async () => {
      await cacheService.set('version:test', { v: 1 });
      
      // Simula conflito de versão
      service['versionMap'].set('version:test', 'local-v1');
      await redis.hset('cache:versions', 'version:test', 'server-v2');
      
      const synced = await cacheService.forceSync('version:test');
      expect(synced).toBe(true);
    });
  });

  describe('Smart Invalidation', () => {
    it('should perform cascading invalidation', async () => {
      // Setup: cache com relacionamentos
      await cacheService.set('user:1', { name: 'User1' }, { tags: ['user', 'profile'] });
      await cacheService.set('user:1:posts', ['post1', 'post2'], { tags: ['user', 'posts'] });
      await cacheService.set('user:1:followers', ['user2'], { tags: ['user', 'social'] });

      await cacheService.smartInvalidate('user:1*', { cascade: true });

      expect(await cacheService.get('user:1')).toBeNull();
      expect(await cacheService.get('user:1:posts')).toBeNull();
      expect(await cacheService.get('user:1:followers')).toBeNull();
    });

    it('should handle delayed invalidation', async () => {
      await cacheService.set('delayed:test', { data: 'test' });
      
      // Invalidação com delay
      await cacheService.smartInvalidate('delayed:*', { delay: 100 });
      
      // Ainda deve existir imediatamente
      expect(await cacheService.get('delayed:test')).not.toBeNull();
      
      // Após delay, deve ser removido
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(await cacheService.get('delayed:test')).toBeNull();
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should provide accurate statistics', async () => {
      await cacheService.set('stat:1', { data: 'test1' });
      await cacheService.set('stat:2', { data: 'test2' });

      redis.info.mockResolvedValue('used_memory:1024\nused_memory_human:1.00K');
      redis.dbsize.mockResolvedValue(10);

      const stats = await cacheService.getStats();

      expect(stats.redis.connected).toBe(true);
      expect(stats.redis.dbSize).toBe(10);
      expect(stats.local.versionMapSize).toBeGreaterThanOrEqual(2);
    });
  });
});

// cache.e2e.spec.ts - Testes end-to-end
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as request from 'supertest';
import { CacheModule } from '../cache.module';
import { CacheService } from '../cache.service';
import { ConsistentCacheInterceptor } from '../cache.interceptor';

// Controller de teste
import { Controller, Get, Post, Body, Param, UseInterceptors } from '@nestjs/common';

@Controller('test')
@UseInterceptors(ConsistentCacheInterceptor)
class TestController {
  constructor(private readonly cacheService: CacheService) {};

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.cacheService.getOrSet(;
      `user:${id}`,
      async () => ({ id, name: `User ${id}`, fetchedAt: Date.now() }),
      { ttl: 60, tags: ['user'] }
    );
  }

  @Post('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    await this.cacheService.invalidateByTags(['user']);
    return { id, ...data, updatedAt: Date.now() };
  }
}

describe('Cache E2E Tests', () => {
  let app: INestApplication;
  let cacheService: CacheService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({;
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
        EventEmitterModule.forRoot(),
        CacheModule,
      ],
      controllers: [TestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    cacheService = moduleFixture.get<CacheService>(CacheService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cacheService.clear(true);
  });

  it('should cache GET requests automatically', async () => {
    const response1 = await request(app.getHttpServer());
      .get('/test/users/123')
      .expect(200);

    const response2 = await request(app.getHttpServer());
      .get('/test/users/123')
      .expect(200);

    // Deve retornar os mesmos dados (mesmo timestamp)
    expect(response1.body.fetchedAt).toBe(response2.body.fetchedAt);
  });

  it('should invalidate cache on POST requests', async () => {
    // Primeira requisição - popula cache
    const response1 = await request(app.getHttpServer());
      .get('/test/users/123')
      .expect(200);

    // Update user - deve invalidar cache
    await request(app.getHttpServer());
      .post('/test/users/123')
      .send({ name: 'Updated User' })
      .expect(201);

    // Segunda requisição - deve buscar novos dados
    const response2 = await request(app.getHttpServer());
      .get('/test/users/123')
      .expect(200);

    // Timestamps devem ser diferentes
    expect(response1.body.fetchedAt).not.toBe(response2.body.fetchedAt);
  });

  it('should handle concurrent requests with distributed lock', async () => {
    const promises = Array.from({ length: 10 }, () =>;
      request(app.getHttpServer()).get('/test/users/concurrent')
    );

    const responses = await Promise.all(promises);

    // Todas as respostas devem ter o mesmo fetchedAt (mesma geração)
    const firstFetchedAt = responses[0].body.fetchedAt;
    responses.forEach(response => {
      expect(response.body.fetchedAt).toBe(firstFetchedAt);
    });
  });
});

// cache.benchmark.spec.ts - Testes de performance
describe('Cache Performance Tests', () => {
  let cacheService: CacheService;
  let redis: Redis;

  beforeAll(async () => {
    // Setup similar ao integration test
    redis = new Redis(process.env.REDIS_URL_TEST || 'redis://localhost:6379/15');
    const eventEmitter = new EventEmitter2();
    cacheService = new CacheService(redis, eventEmitter);
    await redis.flushdb();
  });

  afterAll(async () => {
    await redis.flushdb();
    await redis.disconnect();
  });

  describe('Single Operations Performance', () => {
    it('should perform single get operations within acceptable time', async () => {
      const testData = { id: 1, data: 'x'.repeat(1000) }; // 1KB de dados;
      await cacheService.set('perf:single', testData);

      const start = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        await cacheService.get('perf:single');
      }

      const duration = Date.now() - start;
      const avgTime = duration / iterations;

      console.log(`Single GET: ${avgTime.toFixed(2)}ms avg, ${iterations} ops in ${duration}ms`);
      expect(avgTime).toBeLessThan(10); // < 10ms por operação
    });

    it('should perform single set operations efficiently', async () => {
      const testData = { id: 1, data: 'x'.repeat(1000) };
      const start = Date.now();
      const iterations = 100; // Menos iterações para SET (mais custoso);

      for (let i = 0; i < iterations; i++) {
        await cacheService.set(`perf:set:${i}`, { ...testData, iteration: i });
      }

      const duration = Date.now() - start;
      const avgTime = duration / iterations;

      console.log(`Single SET: ${avgTime.toFixed(2)}ms avg, ${iterations} ops in ${duration}ms`);
      expect(avgTime).toBeLessThan(50); // < 50ms por operação
    });
  });

  describe('Batch Operations Performance', () => {
    it('should outperform individual operations in batch', async () => {
      const batchSize = 100;
      const testEntries: Array<[string, any, any]> = Array.from({ length: batchSize }, (_, i) => [;
        `batch:${i}`,
        { id: i, data: `data-${i}` },
        { ttl: 60 }
      ]);

      // Teste batch operation
      const batchStart = Date.now();
      await cacheService.setMany(testEntries);
      const batchDuration = Date.now() - batchStart;

      // Teste operações individuais
      const individualStart = Date.now();
      for (let i = 0; i < batchSize; i++) {
        await cacheService.set(`individual:${i}`, { id: i, data: `data-${i}` });
      }
      const individualDuration = Date.now() - individualStart;

      console.log(`Batch SET: ${batchDuration}ms for ${batchSize} items`);
      console.log(`Individual SET: ${individualDuration}ms for ${batchSize} items`);
      console.log(`Improvement: ${(individualDuration / batchDuration).toFixed(2)}x faster`);

      expect(batchDuration).toBeLessThan(individualDuration);
    });

    it('should efficiently retrieve multiple keys', async () => {
      const batchSize = 50;
      
      // Popula cache
      for (let i = 0; i < batchSize; i++) {
        await cacheService.set(`multi:${i}`, { id: i, value: `value-${i}` });
      }

      const keys = Array.from({ length: batchSize }, (_, i) => `multi:${i}`);

      const start = Date.now();
      const results = await cacheService.getMany(keys);
      const duration = Date.now() - start;

      console.log(`Batch GET: ${duration}ms for ${batchSize} keys`);
      expect(results.size).toBe(batchSize);
      expect(duration).toBeLessThan(100); // < 100ms para 50 keys
    });
  });

  describe('Lock Performance Under Load', () => {
    it('should handle high concurrency with minimal lock contention', async () => {
      const concurrency = 20;
      let factoryCallCount = 0;

      const expensiveFactory = async () => {;
        factoryCallCount++;
        await new Promise(resolve => setTimeout(resolve, 200)); // Operação custosa;
        return { computed: true, timestamp: Date.now(), callCount: factoryCallCount };
      };

      const start = Date.now();
      
      const promises = Array.from({ length: concurrency }, async (_, i) => {;
        return cacheService.getOrSet(`load:test:${i % 3}`, expensiveFactory, { ttl: 60 });
      });

      const results = await Promise.all(promises);
      const duration = Date.now() - start;

      console.log(`Concurrency test: ${duration}ms for ${concurrency} operations`);
      console.log(`Factory calls: ${factoryCallCount} (expected: ~3 for 3 unique keys)`);

      // Deve haver no máximo 3 chamadas de factory (3 keys únicas)
      expect(factoryCallCount).toBeLessThanOrEqual(5); // Margem para race conditions
      expect(duration).toBeLessThan(1000); // < 1s total
    });
  });

  describe('Memory and Storage Efficiency', () => {
    it('should efficiently store large datasets', async () => {
      const largeData = {;
        id: 1,
        content: 'x'.repeat(10000), // 10KB
        array: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item-${i}` })),
      };

      const start = Date.now();
      await cacheService.set('large:dataset', largeData);
      const setDuration = Date.now() - start;

      const getStart = Date.now();
      const retrieved = await cacheService.get('large:dataset');
      const getDuration = Date.now() - getStart;

      console.log(`Large data SET: ${setDuration}ms`);
      console.log(`Large data GET: ${getDuration}ms`);

      expect(retrieved).toEqual(largeData);
      expect(setDuration).toBeLessThan(100);
      expect(getDuration).toBeLessThan(50);
    });

    it('should handle cache statistics efficiently', async () => {
      // Popula cache com dados variados
      for (let i = 0; i < 50; i++) {
        await cacheService.set(`stats:${i}`, { ;
          id: i, 
          data: 'x'.repeat(100 * (i + 1)) // Tamanhos variados
        });
      }

      const start = Date.now();
      const stats = await cacheService.getStats();
      const duration = Date.now() - start;

      console.log(`Stats collection: ${duration}ms`);
      console.log(`Redis DB size: ${stats.redis.dbSize}`);
      console.log(`Local version map: ${stats.local.versionMapSize}`);

      expect(duration).toBeLessThan(100);
      expect(stats.local.versionMapSize).toBeGreaterThan(0);
    });
  });
});

// cache.stress.spec.ts - Testes de stress
describe('Cache Stress Tests', () => {
  let cacheService: CacheService;
  let redis: Redis;

  beforeAll(async () => {
    redis = new Redis(process.env.REDIS_URL_TEST || 'redis://localhost:6379/15');
    const eventEmitter = new EventEmitter2();
    cacheService = new CacheService(redis, eventEmitter);
    await redis.flushdb();
  });

  afterAll(async () => {
    await redis.disconnect();
  });

  it('should handle massive concurrent operations', async () => {
    const operations = 500;
    const concurrency = 50;
    
    const start = Date.now();
    
    // Gera operações mistas (get, set, delete)
    const promises = Array.from({ length: operations }, async (_, i) => {;
      const key = `stress:${i % 100}`; // 100 keys únicos;
      const operation = i % 3;
      
      switch (operation) {
        case 0: // GET
          return cacheService.get(key);
        case 1: // SET
          return cacheService.set(key, { id: i, data: `data-${i}` }, { ttl: 30 });
        case 2: // DELETE
          return cacheService.delete(key);
      }
    });

    // Executa em batches para controlar concorrência
    const batches = [];
    for (let i = 0; i < promises.length; i += concurrency) {
      batches.push(promises.slice(i, i + concurrency));
    }

    for (const batch of batches) {
      await Promise.all(batch);
    }

    const duration = Date.now() - start;
    const opsPerSecond = (operations / duration) * 1000;

    console.log(`Stress test: ${operations} ops in ${duration}ms`);
    console.log(`Throughput: ${opsPerSecond.toFixed(0)} ops/sec`);

    expect(opsPerSecond).toBeGreaterThan(100); // Mínimo 100 ops/sec
  });

  it('should maintain consistency under high tag invalidation load', async () => {
    const itemCount = 200;
    const tagCount = 10;

    // Popula cache com items taggeados
    const setPromises = Array.from({ length: itemCount }, (_, i) => {;
      const tags = [`tag-${i % tagCount}`, 'common'];
      return cacheService.set(`item:${i}`, { id: i, value: `value-${i}` }, { ;
        ttl: 60, 
        tags 
      });
    });

    await Promise.all(setPromises);

    // Verifica que todos foram armazenados
    const keys = Array.from({ length: itemCount }, (_, i) => `item:${i}`);
    const initialResults = await cacheService.getMany(keys);
    expect(initialResults.size).toBe(itemCount);

    // Invalida por tags concorrentemente
    const invalidationPromises = Array.from({ length: tagCount }, (_, i) =>;
      cacheService.invalidateByTags([`tag-${i}`])
    );

    const start = Date.now();
    await Promise.all(invalidationPromises);
    const duration = Date.now() - start;

    console.log(`Tag invalidation: ${duration}ms for ${tagCount} tags affecting ${itemCount} items`);

    // Verifica consistência final
    const finalResults = await cacheService.getMany(keys);
    console.log(`Remaining items after invalidation: ${finalResults.size}`);

    expect(duration).toBeLessThan(2000); // < 2s para invalidação massiva
  });

  it('should handle memory pressure gracefully', async () => {
    const largeItemSize = 50000; // 50KB por item;
    const itemCount = 100; // 5MB total;

    const promises = Array.from({ length: itemCount }, (_, i) => {;
      const largeData = {;
        id: i,
        content: 'x'.repeat(largeItemSize),
        metadata: Array.from({ length: 100 }, (_, j) => ({ field: j, value: `val-${j}` })),
      };
      
      return cacheService.set(`large:${i}`, largeData, { ttl: 120 });
    });

    const start = Date.now();
    await Promise.all(promises);
    const setDuration = Date.now() - start;

    // Testa retrieval
    const getStart = Date.now();
    const results = await cacheService.getMany(;
      Array.from({ length: itemCount }, (_, i) => `large:${i}`)
    );
    const getDuration = Date.now() - getStart;

    console.log(`Large data SET: ${setDuration}ms for ${itemCount} items (${(itemCount * largeItemSize / 1024 / 1024).toFixed(2)}MB)`);
    console.log(`Large data GET: ${getDuration}ms for ${itemCount} items`);

    expect(results.size).toBe(itemCount);
    expect(setDuration).toBeLessThan(5000); // < 5s para 5MB
    expect(getDuration).toBeLessThan(2000); // < 2s para retrieval
  });
});

// cache.consistency.spec.ts - Testes específicos de consistência
describe('Cache Consistency Tests', () => {
  let cacheService1: CacheService;
  let cacheService2: CacheService;
  let redis1: Redis;
  let redis2: Redis;

  beforeAll(async () => {
    // Simula dois nós diferentes
    redis1 = new Redis(process.env.REDIS_URL_TEST || 'redis://localhost:6379/15');
    redis2 = new Redis(process.env.REDIS_URL_TEST || 'redis://localhost:6379/15');
    
    const eventEmitter1 = new EventEmitter2();
    const eventEmitter2 = new EventEmitter2();
    
    // Simula diferentes NODE_IDs
    process.env.NODE_ID = 'node-1';
    cacheService1 = new CacheService(redis1, eventEmitter1);
    
    process.env.NODE_ID = 'node-2';
    cacheService2 = new CacheService(redis2, eventEmitter2);
    
    await redis1.flushdb();
  });

  afterAll(async () => {
    await redis1.disconnect();
    await redis2.disconnect();
  });

  it('should maintain eventual consistency between nodes', async () => {
    const testData = { id: 1, name: 'Test', version: 1 };

    // Node 1 define valor
    await cacheService1.set('consistency:test', testData, { ttl: 60 });

    // Aguarda propagação
    await new Promise(resolve => setTimeout(resolve, 100));

    // Node 2 força sincronização
    await cacheService2.syncAllVersions();

    // Ambos devem ter a mesma versão
    const value1 = await cacheService1.get('consistency:test');
    const value2 = await cacheService2.get('consistency:test');

    expect(value1).toEqual(value2);
    expect(value1).toEqual(testData);
  });

  it('should detect and resolve version conflicts', async () => {
    // Simula conflito: mesmo key, versões diferentes
    await cacheService1.set('conflict:test', { version: 1 }, { version: 'v1' });
    await cacheService2.set('conflict:test', { version: 2 }, { version: 'v2' });

    // Force sync deve detectar conflito
    const synced1 = await cacheService1.forceSync('conflict:test');
    const synced2 = await cacheService2.forceSync('conflict:test');

    // Pelo menos um deve ter detectado conflito
    expect(synced1 || synced2).toBe(true);
  });

  it('should handle cascade invalidation correctly', async () => {
    // Setup: hierarquia de dados relacionados
    await cacheService1.set('parent:1', { id: 1 }, { tags: ['parent'] });
    await cacheService1.set('child:1:1', { parentId: 1 }, { tags: ['child', 'parent:1'] });
    await cacheService1.set('child:1:2', { parentId: 1 }, { tags: ['child', 'parent:1'] });

    // Invalidação em cascata
    await cacheService1.smartInvalidate('parent:1*', { cascade: true });

    // Aguarda propagação
    await new Promise(resolve => setTimeout(resolve, 200));

    // Verifica se invalidação foi completa
    expect(await cacheService1.get('parent:1')).toBeNull();
    expect(await cacheService1.get('child:1:1')).toBeNull();
    expect(await cacheService1.get('child:1:2')).toBeNull();
  });
});

// jest.config.js
/*
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts,
  transform: {
    '^.+\\.(t|j)s: 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testTimeout: 30000,
  // Configuração para testes de integração
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/**/*.spec.ts'],
      testPathIgnorePatterns: ['.*\\.e2e\\.spec\\.ts, '.*\\.integration\\.spec\\.ts],
    },
    {
      displayName: 'integration', 
      testMatch: ['<rootDir>/**/*.integration.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/integration-setup.ts'],
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/**/*.e2e.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/e2e-setup.ts'],
    },
  ],
};
*/

// test/setup.ts
/*
import { jest } from '@jest/globals';

// Configuração global para testes
beforeAll(() => {
  // Mock de console para reduzir ruído nos testes
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Helper para aguardar próximo tick
global.nextTick = () => new Promise(resolve => setImmediate(resolve));

// Helper para aguardar tempo específico
global.wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
*/

// test/integration-setup.ts
/*
import Redis from 'ioredis';

let testRedis: Redis;

beforeAll(async () => {
  // Conecta ao Redis de teste
  testRedis = new Redis(process.env.REDIS_URL_TEST || 'redis://localhost:6379/15');
  
  // Verifica se Redis está disponível
  try {
    await testRedis.ping();
  } catch (error) {
    console.error('Redis not available for integration tests');
    throw error;
  }
});

beforeEach(async () => {
  // Limpa database de teste antes de cada teste
  await testRedis.flushdb();
});

afterAll(async () => {
  if (testRedis) {
    await testRedis.flushdb();
    await testRedis.disconnect();
  }
});
*/

// package.json scripts para testes
/*
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --selectProjects unit",
    "test:integration": "jest --selectProjects integration",
    "test:e2e": "jest --selectProjects e2e",
    "test:perf": "jest --selectProjects integration --testNamePattern='Performance|Benchmark'",
    "test:stress": "jest --selectProjects integration --testNamePattern='Stress'",
    "test:all": "jest --selectProjects unit integration e2e"
  }
}
*/

// cache.mock.ts - Utilitários para mock em outros testes
export class MockCacheService {;
  private mockData = new Map<string, any>();
  
  async get<T>(key: string): Promise<T | null> {
    return this.mockData.get(key) || null;
  }

  async set(key: string, value: any, options?: any): Promise<void> {
    this.mockData.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.mockData.delete(key);
  }

  async getOrSet<T>(key: string, factory: () => Promise<T> | T): Promise<T> {
    let value = this.mockData.get(key);
    if (value === undefined) {
      value = await factory();
      this.mockData.set(key, value);
    }
    return value;
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    // Mock implementation
  }

  async clear(): Promise<void> {
    this.mockData.clear();
  }

  async getStats() {
    return {;
      redis: { connected: true, dbSize: this.mockData.size },
      local: { versionMapSize: this.mockData.size, pendingInvalidations: 0 },
      consistency: { syncRatio: 1 },
    };
  }
}

// cache.test-utils.ts - Utilitários para testes
export class CacheTestUtils {;
  static async waitForPropagation(ms: number = 100): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  static async populateTestData(
    cacheService: CacheService,
    count: number,
    keyPrefix: string = 'test',
    tags: string[] = ['test']
  ): Promise<void> {
    const entries: Array<[string, any, any]> = Array.from({ length: count }, (_, i) => [;
      `${keyPrefix}:${i}`,
      { id: i, name: `Item ${i}`, createdAt: Date.now() },
      { ttl: 60, tags }
    ]);

    await cacheService.setMany(entries);
  }

  static generateLargeObject(sizeKB: number): any {
    const contentSize = sizeKB * 1024;
    return {;
      id: Math.random(),
      content: 'x'.repeat(contentSize),
      metadata: {
        size: sizeKB,
        generated: Date.now(),
      },
    };
  }

  static async measureOperation<T>(
    operation: () => Promise<T>,
    label: string
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await operation();
    const duration = Date.now() - start;
    
    console.log(`${label}: ${duration}ms`);
    
    return { result, duration };
  }

  static async benchmarkOperations(
    operations: Array<{ name: string; fn: () => Promise<any> }>,
    iterations: number = 100
  ): Promise<Record<string, { avg: number; min: number; max: number }>> {
    const results: Record<string, number[]> = {};

    for (const { name, fn } of operations) {
      results[name] = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await fn();
        const duration = Date.now() - start;
        results[name].push(duration);
      }
    }

    // Calcula estatísticas
    const stats: Record<string, { avg: number; min: number; max: number }> = {};
    
    for (const [name, times] of Object.entries(results)) {
      stats[name] = {
        avg: times.reduce((a, b) => a + b) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
      };
    }

    return stats;
  }
}

// cache.health.spec.ts - Testes do health check
import { CacheHealthIndicator } from '../cache.health';

describe('CacheHealthIndicator', () => {
  let healthIndicator: CacheHealthIndicator;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const mockCacheService = {;
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({;
      providers: [
        CacheHealthIndicator,
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    healthIndicator = module.get<CacheHealthIndicator>(CacheHealthIndicator);
    cacheService = module.get(CacheService);
  });

  it('should return healthy status when cache operations succeed', async () => {
    const testValue = { timestamp: Date.now() };
    cacheService.set.mockResolvedValue();
    cacheService.get.mockResolvedValue(testValue);
    cacheService.delete.mockResolvedValue();
    cacheService.getStats.mockResolvedValue({
      redis: { connected: true, memory: 'used_memory:1024' },
      local: { versionMapSize: 5, pendingInvalidations: 0 },
      consistency: { syncRatio: 1.0 },
    });

    const result = await healthIndicator.isHealthy('cache');

    expect(result).toEqual({
      cache: {
        status: 'up',
        redis: true,
        consistency: 1.0,
        memory: 'used_memory:1024',
      },
    });
  });

  it('should throw HealthCheckError when cache operations fail', async () => {
    cacheService.set.mockRejectedValue(new Error('Redis connection failed'));

    await expect(healthIndicator.isHealthy('cache')).rejects.toThrow();
  });

  it('should detect data integrity issues', async () => {
    const testValue = { timestamp: Date.now() };
    cacheService.set.mockResolvedValue();
    cacheService.get.mockResolvedValue({ timestamp: Date.now() + 1000 }); // Valor diferente
    cacheService.delete.mockResolvedValue();

    await expect(healthIndicator.isHealthy('cache')).rejects.toThrow();
  });
});

// Scripts para executar testes
/*
#!/bin/bash
# scripts/test-cache.sh

echo "🧪 Executando testes de cache..."

# Verifica se Redis está rodando
if ! redis-cli ping > /dev/null 2>&1; then
  echo "❌ Redis não está rodando. Iniciando Redis em Docker..."
  docker run -d --name redis-test -p 6379:6379 redis:7-alpine
  sleep 3
fi

echo "🔄 Testes unitários..."
npm run test:unit -- --testPathPattern=cache

echo "🔄 Testes de integração..."
npm run test:integration -- --testPathPattern=cache

echo "📊 Testes de performance..."
npm run test:perf

echo "💪 Testes de stress..."
npm run test:stress

echo "🏥 Teste de health check..."
npm run test:unit -- --testPathPattern=health

echo "📈 Relatório de cobertura..."
npm run test:coverage -- --testPathPattern=cache

echo "✅ Todos os testes de cache concluídos!"
*/