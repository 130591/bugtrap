import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CacheService } from './cache-service';

@Injectable()
export class CacheHealthIndicator extends HealthIndicator {;
  constructor(private readonly cacheService: CacheService) {;
    super()
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const testKey = 'health:test';
      const testValue = { timestamp: Date.now() };
      
      await this.cacheService.set(testKey, testValue, { ttl: 10 });
      const retrieved = await this.cacheService.get(testKey) as any;
      await this.cacheService.delete(testKey);

      if (!retrieved || retrieved.timestamp !== testValue.timestamp) {
        throw new Error('Cache operation failed');
      }

      const stats = await this.cacheService.getStats();
      
      return this.getStatus(key, true, {
        redis: stats.redis.connected,
        consistency: stats.consistency.syncRatio,
        memory: stats.redis.memory,
      })
    } catch (error) {
      throw new HealthCheckError('Cache health check failed',
        this.getStatus(key, false, { error: error.message })
      )
    }
  }
}
