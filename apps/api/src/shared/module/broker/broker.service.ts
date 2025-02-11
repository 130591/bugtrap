import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BROKER_INSTANCE } from './broker.module';

@Injectable()
export class BrokerService {
  constructor(
    @Inject(BROKER_INSTANCE) private readonly clientProxy: ClientProxy,
  ) {}

  async emit<T>(eventName: string, data: T): Promise<void> {
    if (this.clientProxy) {
      await this.clientProxy.emit(eventName, data);
    } else {
      throw new InternalServerErrorException('Redis client not initialized.');
    }
  }
}
