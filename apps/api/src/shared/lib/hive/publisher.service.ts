import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class PublisherService {
  private readonly redisClient: Redis

  constructor() {
    this.redisClient = new Redis(process.env.REDIS_URL)
  }

  async publish(event: string, data: any): Promise<void> {
    try {
      await this.redisClient.publish(event, JSON.stringify(data))
    } catch (error) {
      console.error(`Failed to publish event ${event}:`, error)
    }
  }
}
