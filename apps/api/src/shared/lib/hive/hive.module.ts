import { DynamicModule, Module, Provider } from '@nestjs/common'
import { DiscoveryModule } from '@golevelup/nestjs-discovery'
import Redis from 'ioredis'
import { QueueService } from './bullmq.service'
import { RedisSubscriberService } from './redis-subscriber.service'
import { RedisProvider } from './provider/redis.provider'
import { PublisherService } from './publisher.service'

@Module({
  imports: [DiscoveryModule],
  providers: [
    QueueService,
    RedisSubscriberService,
		PublisherService,
    ...RedisProvider,
  ],
  exports: [
    QueueService, 
    RedisSubscriberService, 
    PublisherService
  ],
})
export class HiveModule {
  static forRoot(redisConfig: any = { host: 'localhost', port: 6379 }): DynamicModule {
    const redisProvider: Provider = {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisHost = redisConfig.host || 'localhost';
        const redisPort = redisConfig.port || 6379;

        return new Redis({
          host: redisHost,
          port: redisPort,
        });
      },
    }

    return {
      module: HiveModule,
      global: true,
      providers: [redisProvider, PublisherService], 
      exports: [redisProvider, PublisherService],
    }
  }

	static forRootAsync(options: {
    imports?: any[]
    useFactory: (...args: any[]) => Promise<any> | any;
    inject?: any[]
  }): DynamicModule {
    const asyncRedisProvider: Provider = {
      provide: 'REDIS_CONFIG',
      useFactory: options.useFactory,
      inject: options.inject,
    };

    return {
      module: HiveModule,
      imports: [DiscoveryModule, ...(options.imports || [])],
      providers: [asyncRedisProvider, ...RedisProvider, QueueService, PublisherService],
      exports: [asyncRedisProvider, ...RedisProvider, QueueService, PublisherService],
    }
  }
}
