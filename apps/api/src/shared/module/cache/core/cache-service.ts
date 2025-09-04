// cache.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { Redis } from 'ioredis'
import { EventEmitter2 } from '@nestjs/event-emitter'

export interface CacheOptions {
  ttl?: number
  tags?: string[]
  version?: string
  skipEventualConsistency?: boolean
}

export interface CacheMetadata {
  createdAt: number
  expiresAt: number
  version: string
  tags: string[]
  checksum: string
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name)
  private readonly subscriber: Redis
  private readonly publisher: Redis
  private readonly pendingInvalidations = new Set<string>()
  private readonly versionMap = new Map<string, string>()

  constructor(
    private readonly redis: Redis,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Separate Redis for pub/sub (official recommendation)
    this.subscriber = redis.duplicate()
    this.publisher = redis.duplicate()
    
    this.setupEventualConsistency()
  }

  /**
   * Gets a value from cache with consistency check
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const pipeline = this.redis.pipeline()
      pipeline.hgetall(`${key}:meta`)
      pipeline.get(key)
      
      const results = await pipeline.exec()
      const [metaResult, valueResult] = results

      if (!metaResult[1] || !valueResult[1]) {
        return null
      }

      const metadata = metaResult[1] as any
      const value = valueResult[1] as string

      // Check expiration
      if (Date.now() > parseInt(metadata.expiresAt)) {
        await this.delete(key)
        return null
      }

      // Check eventual consistency
      if (!this.isEventuallyConsistent(key, metadata)) {
        this.logger.warn(`Eventual consistency check failed for key: ${key}`)
        await this.delete(key)
        return null
      }

      // Check data integrity
      const expectedChecksum = this.generateChecksum(value)
      if (metadata.checksum !== expectedChecksum) {
        this.logger.error(`Data integrity check failed for key: ${key}`)
        await this.delete(key)
        return null
      }

      this.logger.debug(`Cache hit for key: ${key}`)
      return JSON.parse(value) as T
    } catch (error) {
      this.logger.error(`Error getting cache for key: ${key}`, error)
      return null
    }
  }

  /**
   * Stores a value in cache with metadata for consistency
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const { ttl = 300, tags = [], version, skipEventualConsistency = false } = options
    
    try {
      const now = Date.now()
      const expiresAt = now + (ttl * 1000)
      const serializedValue = JSON.stringify(value)
      const checksum = this.generateChecksum(serializedValue)
      const cacheVersion = version || this.generateVersion(key)

      const metadata: CacheMetadata = {
        createdAt: now,
        expiresAt,
        version: cacheVersion,
        tags,
        checksum,
      }

      // Pipeline for atomic operations
      const pipeline = this.redis.pipeline()
      
      // Store the value
      pipeline.setex(key, ttl, serializedValue)
      
      // Store metadata
      pipeline.hmset(`${key}:meta`, metadata)
      pipeline.expire(`${key}:meta`, ttl)
      
      // Index by tags for batch invalidation
      if (tags.length > 0) {
        tags.forEach(tag => {
          pipeline.sadd(`tag:${tag}`, key)
          pipeline.expire(`tag:${tag}`, ttl)
        })
      }

      // Store version for consistency control
      pipeline.hset('cache:versions', key, cacheVersion)

      await pipeline.exec()

      // Update local version map
      this.versionMap.set(key, cacheVersion)

      // Publish change event for eventual consistency
      if (!skipEventualConsistency) {
        await this.publishCacheChange(key, 'SET', { version: cacheVersion, tags })
      }

      this.logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s, version: ${cacheVersion}`)
    } catch (error) {
      this.logger.error(`Error setting cache for key: ${key}`, error)
      throw error
    }
  }

  /**
   * Remove um item do cache com propagação de invalidação
   */
  async delete(key: string): Promise<void> {
    try {
      const metadata = await this.redis.hgetall(`${key}:meta`)
      
      const pipeline = this.redis.pipeline()
      pipeline.del(key)
      pipeline.del(`${key}:meta`)
      pipeline.hdel('cache:versions', key)

      // Remove das tags
      if (metadata.tags) {
        const tags = metadata.tags.split(',')
        tags.forEach(tag => {
          if (tag.trim()) {
            pipeline.srem(`tag:${tag.trim()}`, key)
          }
        })
      }

      await pipeline.exec()

      // Remove do mapa local
      this.versionMap.delete(key)

      // Publica invalidação
      await this.publishCacheChange(key, 'DELETE', { tags: metadata.tags?.split(',') || [] })

      this.logger.debug(`Cache deleted for key: ${key}`)
    } catch (error) {
      this.logger.error(`Error deleting cache for key: ${key}`, error)
      throw error
    }
  }

  /**
   * Invalida cache por tags (útil para invalidação em lote)
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      const keys = new Set<string>()
      
      // Obtém todas as chaves associadas às tags
      for (const tag of tags) {
        const tagKeys = await this.redis.smembers(`tag:${tag}`)
        tagKeys.forEach(key => keys.add(key))
      }

      // Remove todas as chaves encontradas
      if (keys.size > 0) {
        await Promise.all(Array.from(keys).map(key => this.delete(key)))
        this.logger.debug(`Invalidated ${keys.size} keys by tags: ${tags.join(', ')}`)
      }

      // Publica evento de invalidação por tags
      await this.publishCacheChange('*', 'INVALIDATE_TAGS', { tags })
    } catch (error) {
      this.logger.error(`Error invalidating by tags: ${tags.join(', ')}`, error)
      throw error
    }
  }

  /**
   * Padrão cache-aside com retry e lock distribuído
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOptions = {},
  ): Promise<T> {
    // Primeiro tenta obter do cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Lock distribuído para evitar thundering herd
    const lockKey = `lock:${key}`
    const lockValue = `${Date.now()}-${Math.random()}`
    const lockTtl = 30 // 30 segundos

    try {
      const lockAcquired = await this.redis.set(lockKey, lockValue, 'PX', lockTtl * 1000, 'NX')
      
      if (!lockAcquired) {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
        
        const cachedAfterWait = await this.get<T>(key)
        if (cachedAfterWait !== null) {
          return cachedAfterWait
        }

        this.logger.warn(`Lock acquisition failed for key: ${key}, proceeding without lock`)
      }

      const value = await factory()
      
      await this.set(key, value, options)
      
      return value
    } catch (error) {
      this.logger.error(`Error in getOrSet for key: ${key}`, error)
      throw error
    } finally {
      try {
        const currentLock = await this.redis.get(lockKey)
        if (currentLock === lockValue) {
          await this.redis.del(lockKey)
        }
      } catch (lockError) {
        this.logger.warn(`Error releasing lock for key: ${key}`, lockError)
      }
    }
  }

  /**
   * Operações em lote otimizadas
   */
  async setMany(entries: Array<[string, any, CacheOptions?]>): Promise<void> {
    const pipeline = this.redis.pipeline()
    const events: Array<{ key: string; options: CacheOptions }> = []

    for (const [key, value, options = {}] of entries) {
      const { ttl = 300, tags = [], version } = options
      const now = Date.now()
      const expiresAt = now + (ttl * 1000)
      const serializedValue = JSON.stringify(value)
      const checksum = this.generateChecksum(serializedValue)
      const cacheVersion = version || this.generateVersion(key)

      const metadata: CacheMetadata = {
        createdAt: now,
        expiresAt,
        version: cacheVersion,
        tags,
        checksum,
      }

      pipeline.setex(key, ttl, serializedValue)
      pipeline.hmset(`${key}:meta`, metadata)
      pipeline.expire(`${key}:meta`, ttl)
      pipeline.hset('cache:versions', key, cacheVersion)

      tags.forEach(tag => {
        pipeline.sadd(`tag:${tag}`, key)
        pipeline.expire(`tag:${tag}`, ttl)
      })

      this.versionMap.set(key, cacheVersion)
      events.push({ key, options })
    }

    await pipeline.exec()

    // Publica eventos de mudança em lote
    for (const { key, options } of events) {
      if (!options.skipEventualConsistency) {
        await this.publishCacheChange(key, 'SET', { 
          version: this.versionMap.get(key), 
          tags: options.tags || [] 
        })
      }
    }

    this.logger.debug(`Batch set completed for ${entries.length} keys`)
  }

  /**
   * Obtém múltiplos valores com verificação de consistência
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    const pipeline = this.redis.pipeline()
    
    keys.forEach(key => {
      pipeline.hgetall(`${key}:meta`)
      pipeline.get(key)
    })

    const results = await pipeline.exec()
    const resultMap = new Map<string, T>()

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const metaResult = results[i * 2]
      const valueResult = results[i * 2 + 1]

      if (metaResult[1] && valueResult[1]) {
        const metadata = metaResult[1] as any
        const value = valueResult[1] as string

        // Verificações de consistência
        if (Date.now() <= parseInt(metadata.expiresAt) &&
            this.isEventuallyConsistent(key, metadata) &&
            metadata.checksum === this.generateChecksum(value)) {
              try {
                resultMap.set(key, JSON.parse(value) as T)
              } catch (parseError) {
                // this.logger.error(`JSON parse error for key: ${key}`, parseError)
                await this.delete(key)
              } 
        } else {
          await this.delete(key)
        }
      }
    }

    return resultMap
  }

  /**
   * Força sincronização de um item específico
   */
  async forceSync(key: string): Promise<boolean> {
    try {
      // Obtém versão do servidor central
      const serverVersion = await this.redis.hget('cache:versions', key)
      const localVersion = this.versionMap.get(key)

      if (serverVersion && serverVersion !== localVersion) {
        // Versões diferentes, remove cache local para forçar regeneração
        await this.delete(key)
        this.logger.debug(`Forced sync completed for key: ${key}`)
        return true
      }

      return false
    } catch (error) {
      this.logger.error(`Error in force sync for key: ${key}`, error)
      return false
    }
  }

  /**
   * Invalidação inteligente com propagação
   */
  async smartInvalidate(pattern: string, options: { cascade?: boolean; delay?: number } = {}): Promise<void> {
    const { cascade = true, delay = 0 } = options

    try {
      if (delay > 0) {
        setTimeout(async () => {
          await this.performInvalidation(pattern, cascade)
        }, delay)
      } else {
        await this.performInvalidation(pattern, cascade)
      }
    } catch (error) {
      this.logger.error(`Error in smart invalidate for pattern: ${pattern}`, error)
      throw error
    }
  }

  /**
   * Cache com refresh automático (read-through + refresh-ahead)
   */
  async getWithAutoRefresh<T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOptions & { refreshThreshold?: number } = {},
  ): Promise<T> {
    const { refreshThreshold = 0.8, ttl = 300 } = options

    const cached = await this.get<T>(key)
    
    if (cached !== null) {
      // Verifica se precisa fazer refresh preventivo
      const metadata = await this.redis.hgetall(`${key}:meta`)
      if (metadata.createdAt && metadata.expiresAt) {
        const age = Date.now() - parseInt(metadata.createdAt)
        const lifetime = parseInt(metadata.expiresAt) - parseInt(metadata.createdAt)
        const ageRatio = age / lifetime

        if (ageRatio >= refreshThreshold) {
          // Refresh assíncrono para manter performance
          setImmediate(async () => {
            try {
              const newValue = await factory()
              await this.set(key, newValue, options)
              this.logger.debug(`Background refresh completed for key: ${key}`)
            } catch (error) {
              this.logger.error(`Background refresh failed for key: ${key}`, error)
            }
          })
        }
      }

      return cached
    }

    // Cache miss, gera valor
    return this.getOrSet(key, factory, options)
  }


  /**
   * Setup do sistema de consistência eventual
   */
  private async setupEventualConsistency(): Promise<void> {
    await this.subscriber.subscribe('cache:invalidation', 'cache:changes')

    this.subscriber.on('message', async (channel, message) => {
      try {
        const event = JSON.parse(message)
        
        switch (channel) {
          case 'cache:invalidation':
            await this.handleInvalidationEvent(event)
            break
          case 'cache:changes':
            await this.handleChangeEvent(event)
            break
        }
      } catch (error) {
        this.logger.error(`Error processing pub/sub message from ${channel}`, error)
      }
    })

    this.logger.debug('Eventual consistency system initialized')
  }

  /**
   * Verifica se um item está eventualmente consistente
   */
  private isEventuallyConsistent(key: string, metadata: any): boolean {
    // Se está na lista de invalidações pendentes, não é consistente
    if (this.pendingInvalidations.has(key)) {
      return false
    }

    // Verifica versão local vs metadados
    const localVersion = this.versionMap.get(key)
    if (localVersion && localVersion !== metadata.version) {
      return false
    }

    return true
  }

  /**
   * Publica mudanças para outros nós
   */
  private async publishCacheChange(key: string, operation: string, data: any): Promise<void> {
    const event = {
      key,
      operation,
      timestamp: Date.now(),
      nodeId: process.env.NODE_ID || 'unknown',
      data,
    }

    await this.publisher.publish('cache:changes', JSON.stringify(event))
  }

  /**
   * Processa eventos de mudança de cache
   */
  private async handleChangeEvent(event: {
    key: string
    operation: string
    data: any
    nodeId: string
    timestamp: number
  }): Promise<void> {
    const { key, operation, data, nodeId } = event
    
    // Ignora eventos próprios
    if (nodeId === (process.env.NODE_ID || 'unknown')) {
      return
    }

    switch (operation) {
      case 'SET':
        this.versionMap.set(key, data.version)
        break
      case 'DELETE':
        this.versionMap.delete(key)
        this.pendingInvalidations.add(key)
        // Remove da lista após um tempo
        setTimeout(() => this.pendingInvalidations.delete(key), 5000)
        break
      case 'INVALIDATE_TAGS':
        // Marca itens com essas tags como pendentes de invalidação
        for (const tag of data.tags) {
          const keys = await this.redis.smembers(`tag:${tag}`)
          keys.forEach(k => this.pendingInvalidations.add(k))
        }
        break
    }

    // Emite evento local para outros serviços
    this.eventEmitter.emit('cache.change', event)
  }

  /**
   * Processa eventos de invalidação
   */
  private async handleInvalidationEvent(event: any): Promise<void> {
    const { keys, pattern, tags } = event

    if (keys) {
      await Promise.all(keys.map(key => this.delete(key)))
    } else if (pattern) {
      const matchingKeys = await this.redis.keys(pattern)
      await Promise.all(matchingKeys.map(key => this.delete(key)))
    } else if (tags) {
      await this.invalidateByTags(tags)
    }
  }

  /**
   * Realiza invalidação com cascata
   */
  private async performInvalidation(pattern: string, cascade: boolean): Promise<void> {
    const keys = await this.redis.keys(pattern)
    
    if (cascade) {
      // Obtém todas as tags associadas antes de deletar
      const allTags = new Set<string>()
      for (const key of keys) {
        const metadata = await this.redis.hgetall(`${key}:meta`)
        if (metadata.tags) {
          metadata.tags.split(',').forEach(tag => {
            if (tag.trim()) allTags.add(tag.trim())
          })
        }
      }

      // Deleta as chaves
      await Promise.all(keys.map(key => this.delete(key)))

      // Invalida por tags em cascata
      if (allTags.size > 0) {
        await this.invalidateByTags(Array.from(allTags))
      }
    } else {
      await Promise.all(keys.map(key => this.delete(key)))
    }

    // Publica invalidação
    await this.publisher.publish('cache:invalidation', JSON.stringify({
      pattern,
      keys,
      cascade,
      timestamp: Date.now(),
    }))
  }

  /**
   * Gera versão única para controle de consistência
   */
  private generateVersion(key: string): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Gera checksum para verificação de integridade
   */
  private generateChecksum(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  /**
   * Estatísticas avançadas do cache
   */
  async getStats(): Promise<{
    redis: any
    local: any
    consistency: any
  }> {
    const info = await this.redis.info('memory')
    const dbSize = await this.redis.dbsize()
    const versions = await this.redis.hgetall('cache:versions')

    return {
      redis: {
        memory: info,
        dbSize,
        connected: this.redis.status === 'ready',
      },
      local: {
        versionMapSize: this.versionMap.size,
        pendingInvalidations: this.pendingInvalidations.size,
      },
      consistency: {
        totalVersions: Object.keys(versions).length,
        localVersions: this.versionMap.size,
        syncRatio: this.versionMap.size / Math.max(1, Object.keys(versions).length),
      },
    }
  }

  /**
   * Sincronização manual de todas as versões
   */
  async syncAllVersions(): Promise<void> {
    try {
      const serverVersions = await this.redis.hgetall('cache:versions')
      let syncedCount = 0

      for (const [key, serverVersion] of Object.entries(serverVersions)) {
        const localVersion = this.versionMap.get(key)
        if (localVersion !== serverVersion) {
          await this.delete(key)
          syncedCount++
        }
      }

      // Atualiza mapa local
      this.versionMap.clear()
      Object.entries(serverVersions).forEach(([key, version]) => {
        this.versionMap.set(key, version)
      })

      this.logger.debug(`Version sync completed. Synced ${syncedCount} keys`)
    } catch (error) {
      this.logger.error('Error in version sync', error)
      throw error
    }
  }

  /**
   * Limpa todo o cache com confirmação
   */
  async clear(confirm: boolean = false): Promise<void> {
    if (!confirm) {
      throw new Error('Clear operation requires explicit confirmation')
    }

    try {
      await this.redis.flushdb()
      this.versionMap.clear()
      this.pendingInvalidations.clear()
      
      await this.publisher.publish('cache:invalidation', JSON.stringify({
        pattern: '*',
        clearAll: true,
        timestamp: Date.now(),
      }))

      this.logger.warn('Cache completely cleared')
    } catch (error) {
      this.logger.error('Error clearing cache', error)
      throw error
    }
  }

  /**
   * Cleanup na destruição do módulo
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.subscriber.disconnect()
      await this.publisher.disconnect()
      this.logger.debug('Cache service disconnected')
    } catch (error) {
      this.logger.error('Error during cache service cleanup', error)
    }
  }
}
