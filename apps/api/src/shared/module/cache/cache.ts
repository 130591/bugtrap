import { Injectable } from '@nestjs/common'
import { createClient } from 'redis'

@Injectable()
export class CacheService {
  private client

  constructor() {
    this.client = createClient()
    this.client.connect()
  }

  async getUserInfo(userId: string): Promise<{ accountId: string; permissions: string[] } | null> {
    const key = `user:${userId}`
    const data = await this.client.get(key)

    if (!data) return null
    return JSON.parse(data)
  }

  async setUserInfo(userId: string, info: { accountId: string; permissions: string[] }, ttlSeconds = 1800) {
    const key = `user:${userId}`
    await this.client.set(key, JSON.stringify(info), { EX: ttlSeconds })
  }

	async userHasAccess(userId: string, accountId: string): Promise<boolean> {
    if (!userId || !accountId) return false

    const cached = await this.getUserInfo(userId)

    // If there is no cache, it may throw an error or fallback to the database.
    if (!cached) return false

    return cached.accountId === accountId
  }
}