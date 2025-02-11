import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@src/shared/config/service/config.service';
import { ConfigModule } from '@src/shared/config/config.module';
import { BrokerService } from './broker.service';

export const BROKER_INSTANCE = 'REDIS_SERVICE'

@Module({
  imports: [ConfigModule],
})
export class BrokerModule {
  static forRoot(): DynamicModule {
    return {
      module: BrokerModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: BROKER_INSTANCE,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
              transport: Transport.REDIS,
              options: {
                host: configService.get('redis').host || 'localhost',
                port: Number(configService.get('redis').port) || 6379,
              },
            }),
          },
        ]),
      ],
      providers: [BrokerService],
      exports: [BrokerService],
    };
  }
}