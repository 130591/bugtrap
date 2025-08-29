import { Injectable } from "@nestjs/common"

@Injectable()
export class CacheService {
  get<T>(key: string): T | null {
    return null
  }

  set(key: string, value: any, ttl?: number): void {}

  delete(key: string): void {}
}