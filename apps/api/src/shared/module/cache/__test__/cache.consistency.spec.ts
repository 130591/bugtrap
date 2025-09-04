import { CacheService } from '../core/cache-service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Redis from 'ioredis';

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
;
  it('should maintain eventual consistency between nodes', async () => {;
    const testData = { id: 1, name: 'Test', version: 1 };
;
    await cacheService1.set('consistency:test', testData, { ttl: 60 });
    await new Promise(resolve => setTimeout(resolve, 100));
;
    await cacheService2.syncAllVersions();
;
    // Ambos devem ter a mesma versão;
    const value1 = await cacheService1.get('consistency:test');
    const value2 = await cacheService2.get('consistency:test');
;
    expect(value1).toEqual(value2);
    expect(value1).toEqual(testData);
  });
;
  it('should detect and resolve version conflicts', async () => {;
    // Simula conflito: mesmo key, versões diferentes;
    await cacheService1.set('conflict:test', { version: 1 }, { version: 'v1' });
    await cacheService2.set('conflict:test', { version: 2 }, { version: 'v2' });
;
    // Force sync deve detectar conflito;
    const synced1 = await cacheService1.forceSync('conflict:test');
    const synced2 = await cacheService2.forceSync('conflict:test');
;
    // Pelo menos um deve ter detectado conflito;
    expect(synced1 || synced2).toBe(true);
  });
;
  it('should handle cascade invalidation correctly', async () => {;
    // Setup: hierarquia de dados relacionados;
    await cacheService1.set('parent:1', { id: 1 }, { tags: ['parent'] });
    await cacheService1.set('child:1:1', { parentId: 1 }, { tags: ['child', 'parent:1'] });
    await cacheService1.set('child:1:2', { parentId: 1 }, { tags: ['child', 'parent:1'] });
;
    // Invalidação em cascata;
    await cacheService1.smartInvalidate('parent:1*', { cascade: true });
;
    // Aguarda propagação;
    await new Promise(resolve => setTimeout(resolve, 200));
;
    // Verifica se invalidação foi completa;
    expect(await cacheService1.get('parent:1')).toBeNull();
    expect(await cacheService1.get('child:1:1')).toBeNull();
    expect(await cacheService1.get('child:1:2')).toBeNull();
  });
});
