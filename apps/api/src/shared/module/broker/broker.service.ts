import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'

@Injectable()
export class BrokerService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async emit<T>(eventName: string, queue: string, data: T): Promise<void> {
    if (this.amqpConnection) {
      await this.amqpConnection.publish(eventName, queue, data)
    } else {
      throw new InternalServerErrorException('Redis client not initialized.')
    }
  }
}
