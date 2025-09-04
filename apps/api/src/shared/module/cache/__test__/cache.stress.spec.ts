import { CacheService } from '../core/cache-service'
import { Redis } from 'ioredis'
import { EventEmitter2 } from '@nestjs/event-emitter'

describe('Cache Stress Tests', () => {
  let cacheService: CacheService
  let redis: Redis

  beforeAll(async () => {
    redis = new Redis(process.env.REDIS_URL_TEST || 'redis://localhost:6379/15')
    const eventEmitter = new EventEmitter2()
    cacheService = new CacheService(redis, eventEmitter)
    await redis.flushdb()
  })

  afterAll(async () => {
    await redis.disconnect()
  })

  it('should handle massive concurrent operations', async () => {
    const operations = 500
    const concurrency = 50
    
    const start = Date.now()
    
    // Gera operações mistas (get, set, delete)
    const promises = Array.from({ length: operations }, async (_, i) => {
      const key = `stress:${i % 100}` // 100 keys únicos
      const operation = i % 3
      
      switch (operation) {
        case 0: // GET
          return cacheService.get(key)
        case 1: // SET
          return cacheService.set(key, { id: i, data: `data-${i}` }, { ttl: 30 })
        case 2: // DELETE
          return cacheService.delete(key)
      }
    })

    // Executa em batches para controlar concorrência
    const batches = []
    for (let i = 0; i < promises.length; i += concurrency) {
      batches.push(promises.slice(i, i + concurrency))
    }

    for (const batch of batches) {
      await Promise.all(batch)
    }

    const duration = Date.now() - start
    const opsPerSecond = (operations / duration) * 1000

    console.log(`Stress test: ${operations} ops in ${duration}ms`)
    console.log(`Throughput: ${opsPerSecond.toFixed(0)} ops/sec`)

    expect(opsPerSecond).toBeGreaterThan(100) // Mínimo 100 ops/sec
  })

  it('should maintain consistency under high tag invalidation load', async () => {
    const itemCount = 200
    const tagCount = 10

    // Popula cache com items taggeados
    const setPromises = Array.from({ length: itemCount }, (_, i) => {
      const tags = [`tag-${i % tagCount}`, 'common']
      return cacheService.set(`item:${i}`, { id: i, value: `value-${i}` }, { 
        ttl: 60, 
        tags 
      })
    })

    await Promise.all(setPromises)

    // Verifica que todos foram armazenados
    const keys = Array.from({ length: itemCount }, (_, i) => `item:${i}`)
    const initialResults = await cacheService.getMany(keys)
    expect(initialResults.size).toBe(itemCount)

    // Invalida por tags concorrentemente
    const invalidationPromises = Array.from({ length: tagCount }, (_, i) =>
      cacheService.invalidateByTags([`tag-${i}`])
    )

    const start = Date.now()
    await Promise.all(invalidationPromises)
    const duration = Date.now() - start

    console.log(`Tag invalidation: ${duration}ms for ${tagCount} tags affecting ${itemCount} items`)

    // Verifica consistência final
    const finalResults = await cacheService.getMany(keys)
    console.log(`Remaining items after invalidation: ${finalResults.size}`)

    expect(duration).toBeLessThan(2000) // < 2s para invalidação massiva
  })

  it('should handle memory pressure gracefully', async () => {
    const largeItemSize = 50000 // 50KB por item
    const itemCount = 100 // 5MB total

    const promises = Array.from({ length: itemCount }, (_, i) => {
      const largeData = {
        id: i,
        content: 'x'.repeat(largeItemSize),
        metadata: Array.from({ length: 100 }, (_, j) => ({ field: j, value: `val-${j}` })),
      }
      
      return cacheService.set(`large:${i}`, largeData, { ttl: 120 })
    })

    const start = Date.now()
    await Promise.all(promises)
    const setDuration = Date.now() - start

    // Testa retrieval
    const getStart = Date.now()
    const results = await cacheService.getMany(
      Array.from({ length: itemCount }, (_, i) => `large:${i}`)
    )
    const getDuration = Date.now() - getStart

    console.log(`Large data SET: ${setDuration}ms for ${itemCount} items (${(itemCount * largeItemSize / 1024 / 1024).toFixed(2)}MB)`)
    console.log(`Large data GET: ${getDuration}ms for ${itemCount} items`)

    expect(results.size).toBe(itemCount)
    expect(setDuration).toBeLessThan(5000) // < 5s para 5MB
    expect(getDuration).toBeLessThan(2000) // < 2s para retrieval
  })
})
