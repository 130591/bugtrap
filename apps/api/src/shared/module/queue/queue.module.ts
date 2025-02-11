import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@src/shared/config/service/config.service';
import { ConfigModule } from '@src/shared/config/config.module';
import { QueueService } from './queue.service';
import { QueueFactory } from './queues-factory';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis').host || 'localhost',
          port: configService.get('redis').port || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
    ...QueueFactory.map((queueList) => ({
        name: queueList
      })
    ).flat())
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
