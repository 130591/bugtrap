import { Injectable, Inject, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly workers: Map<string, Queue> = new Map()

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async onModuleInit() {
    if (this.redis.status !== 'ready') {
      await new Promise((resolve) => {
        this.redis.on('ready', resolve)
      })
      console.log('Redis está pronto para uso')
    }
  }

  private getQueue(queueName: string): Queue {
    if (!this.workers.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: this.redis,  
      });
      this.workers.set(queueName, queue)
    }
    return this.workers.get(queueName)
  }

  async addJob(queueName: string, job: any, options?: any) {
    try {
      const queue = this.getQueue(queueName)
      await queue.add(queueName, job, { ...options, attempts: 3, backoff: 5000 })
    } catch (error) {
      throw error
    }
  }
}
