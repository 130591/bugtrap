import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter'
import Redis from 'ioredis'
import { CacheService } from './core/cache-service'

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          // Configuration for consistency
          enableReadyCheck: true,
          maxLoadingTimeout: 5000,
        })
      },
      inject: [ConfigService],
    },
    {
      provide: CacheService,
      useFactory: (redis: Redis, eventEmitter: EventEmitter2) => {
        return new CacheService(redis, eventEmitter);
      },
      inject: ['REDIS_CLIENT', EventEmitter2],
    },
  ],
  exports: [CacheService],
})
export class CacheModule {};

