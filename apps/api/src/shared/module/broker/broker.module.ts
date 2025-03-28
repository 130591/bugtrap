import { DynamicModule, Module } from '@nestjs/common'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { ConfigService } from '@src/shared/config/service/config.service'
import { ConfigModule } from '@src/shared/config/config.module'
import { BrokerService } from './broker.service'

@Module({
  imports: [ConfigModule],
})
export class BrokerModule {
  static forRoot(): DynamicModule {
    return {
      module: BrokerModule,
      imports: [
        RabbitMQModule.forRootAsync({
          useFactory: async (configService: ConfigService) => ({
            exchanges: [
              { name: 'exchange.identity', type: 'topic', createExchangeIfNotExists: true }, 
              { name: 'exchange.invite', type: 'topic', createExchangeIfNotExists: true }
            ],
            uri: configService.get('broker_uri') || 'amqp://localhost',
            enableControllerDiscovery: true,
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [BrokerService],
      exports: [BrokerService],
    }
  }
}