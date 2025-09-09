import { CacheService } from '../core/cache-service'

export class CacheTestUtils {
  static async waitForPropagation(ms: number = 100): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms))
  }
  static async populateTestData(
    cacheService: CacheService,
    count: number,
    keyPrefix: string = 'test',
    tags: string[] = ['test']
  ): Promise<void> {
    const entries: Array<[string, any, any]> = Array.from({ length: count }, (_, i) => [
      `${keyPrefix}:${i}`,
      { id: i, name: `Item ${i}`, createdAt: Date.now() },
      { ttl: 60, tags }
    ])
    await cacheService.setMany(entries)
  }
  static generateLargeObject(sizeKB: number): any {
    const contentSize = sizeKB * 1024
    return {
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
    const start = Date.now()
    const result = await operation()
    const duration = Date.now() - start
    console.log(`${label}: ${duration}ms`)
    return { result, duration }
  }
  static async benchmarkOperations(
    operations: Array<{ name: string; fn: () => Promise<any> }>,
    iterations: number = 100
  ): Promise<Record<string, { avg: number; min: number; max: number }>> {
    const results: Record<string, number[]> = {}

    for (const { name, fn } of operations) {
      results[name] = []
      for (let i = 0; i < iterations; i++) {
        const start = Date.now()
        await fn()
        const duration = Date.now() - start
        results[name].push(duration)
      }
    }

    const stats: Record<string, { avg: number; min: number; max: number }> = {}
    for (const [name, times] of Object.entries(results)) {
      stats[name] = {
        avg: times.reduce((a, b) => a + b) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
      }
    }
    return stats
  }
}
