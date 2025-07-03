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

	async userHasAccess(userId: string, organizationId: string): Promise<boolean> {
    if (!userId || !organizationId) return false

    const cached = await this.getUserInfo(userId)

    // If there is no cache, it may throw an error or fallback to the database.
    if (!cached) return false

    return cached.accountId === organizationId
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    const result = await this.client.get(`revoked-tokens:${jti}`)
    return result !== null
  }

  async revokeToken(jti: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`revoked-tokens:${jti}`, 'revoked', 'EX', ttlSeconds)
  }
}