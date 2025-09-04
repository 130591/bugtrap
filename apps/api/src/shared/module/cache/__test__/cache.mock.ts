export class MockCacheService {
  private mockData = new Map<string, any>()
  
  async get<T>(key: string): Promise<T | null> {
    return this.mockData.get(key) || null
  }

  async set(key: string, value: any, options?: any): Promise<void> {
    this.mockData.set(key, value)
  }

  async delete(key: string): Promise<void> {
    this.mockData.delete(key)
  }

  async getOrSet<T>(key: string, factory: () => Promise<T> | T): Promise<T> {
    let value = this.mockData.get(key)
    if (value === undefined) {
      value = await factory()
      this.mockData.set(key, value)
    }
    return value
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    // Mock implementation
  }

  async clear(): Promise<void> {
    this.mockData.clear()
  }

  async getStats() {
    return {
      redis: { connected: true, dbSize: this.mockData.size },
      local: { versionMapSize: this.mockData.size, pendingInvalidations: 0 },
      consistency: { syncRatio: 1 },
    }
  }
}

