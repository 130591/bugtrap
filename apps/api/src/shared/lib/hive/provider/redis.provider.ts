import { Provider } from '@nestjs/common'
import Redis from 'ioredis'

export const RedisProvider: Provider[] = [
  {
    provide: 'REDIS_CLIENT',
    useFactory: () => {
      return new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      });
    },
  },
  {
    provide: 'REDIS_SUBSCRIBER',
    useFactory: () => {
      return new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      })
    },
  },
]

