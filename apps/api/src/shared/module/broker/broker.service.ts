import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class BrokerService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async emit<T>(exchange: string, routingKey: string, data: T): Promise<void> {
    if (!this.amqpConnection) {
      throw new InternalServerErrorException('RabbitMQ connection not initialized.');
    }

    try {
      await this.amqpConnection.publish(exchange, routingKey, data);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to publish message: ${error.message}`);
    }
  }
}
