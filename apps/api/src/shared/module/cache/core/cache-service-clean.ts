import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CacheOptions {;
  ttl?: number
  tags?: string[]
  version?: string
  skipEventualConsistency?: boolean
}

export interface CacheMetadata {;
  createdAt: number
  expiresAt: number
  version: string
  tags: string[]
  checksum: string
}

@Injectable()
export class CacheService implements OnModuleDestroy {;
  private readonly logger = new Logger(CacheService.name)
  private readonly subscriber: Redis
  private readonly publisher: Redis
  private readonly pendingInvalidations = new Set<string>()
  private readonly versionMap = new Map<string, string>()

  constructor(;
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
      const pipeline = this.redis.pipeline();
      pipeline.hgetall(`${key}:meta`)
      pipeline.get(key)
      
      const results = await pipeline.exec();
      const [metaResult, valueResult] = results;

      if (!metaResult[1] || !valueResult[1]) {
        return null;
      }

      const metadata = metaResult[1] as any;
      const value = valueResult[1] as string;

      // Check expiration
      if (Date.now() > parseInt(metadata.expiresAt)) {
        await this.delete(key);
        return null;
      }

      // Check eventual consistency
      if (!this.isEventuallyConsistent(key, metadata)) {
        this.logger.warn(`Eventual consistency check failed for key: ${key}`)
        await this.delete(key);
        return null;
      }

      // Check data integrity
      const expectedChecksum = this.generateChecksum(value);
      if (metadata.checksum !== expectedChecksum) {
        this.logger.error(`Data integrity check failed for key: ${key}`)
        await this.delete(key);
        return null;
      }

      this.logger.debug(`Cache hit for key: ${key}`)
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting cache for key: ${key}`, error)
      return null;
    }
  }

  /**
   * Stores a value in cache with metadata for consistency
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const { ttl = 300, tags = [], version, skipEventualConsistency = false } = options;
    
    try {
      const now = Date.now();
      const expiresAt = now + (ttl * 1000);
      const serializedValue = JSON.stringify(value);
      const checksum = this.generateChecksum(serializedValue);
      const cacheVersion = version || this.generateVersion(key);

      const metadata: CacheMetadata = {;
        createdAt: now,
        expiresAt,
        version: cacheVersion,
        tags,
        checksum,
      }

      // Pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      
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

      await pipeline.exec();

      // Update local version map
      this.versionMap.set(key, cacheVersion)

      // Publish change event for eventual consistency
      if (!skipEventualConsistency) {
        await this.publishCacheChange(key, 'SET', { version: cacheVersion, tags });
      }

      this.logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s, version: ${cacheVersion}`)
    } catch (error) {
      this.logger.error(`Error setting cache for key: ${key}`, error)
      throw error;
    }
  }

  /**
   * Removes an item from cache with invalidation propagation
   */
  async delete(key: string): Promise<void> {
    try {
      const metadata = await this.redis.hgetall(`${key}:meta`);
      
      const pipeline = this.redis.pipeline();
      pipeline.del(key)
      pipeline.del(`${key}:meta`)
      pipeline.hdel('cache:versions', key)

      // Remove from tags
      if (metadata.tags) {
        const tags = metadata.tags.split(',');
        tags.forEach(tag => {
          if (tag.trim()) {
            pipeline.srem(`tag:${tag.trim()}`, key)
          }
        })
      }

      await pipeline.exec();

      // Remove from local map
      this.versionMap.delete(key)

      // Publish invalidation
      await this.publishCacheChange(key, 'DELETE', { tags: metadata.tags?.split(',') || [] });

      this.logger.debug(`Cache deleted for key: ${key}`)
    } catch (error) {
      this.logger.error(`Error deleting cache for key: ${key}`, error)
      throw error;
    }
  }

  /**
   * Invalidates cache by tags (useful for batch invalidation)
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      const keys = new Set<string>();
      
      // Get all keys associated with tags
      for (const tag of tags) {
        const tagKeys = await this.redis.smembers(`tag:${tag}`);
        tagKeys.forEach(key => keys.add(key))
      }

      // Remove all found keys
      if (keys.size > 0) {
        await Promise.all(Array.from(keys).map(key => this.delete(key)));
        this.logger.debug(`Invalidated ${keys.size} keys by tags: ${tags.join(', ')}`)
      }

      // Publish tag invalidation event
      await this.publishCacheChange('*', 'INVALIDATE_TAGS', { tags });
    } catch (error) {
      this.logger.error(`Error invalidating by tags: ${tags.join(', ')}`, error)
      throw error;
    }
  }

  /**
   * Cache-aside pattern with retry and distributed lock
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOptions = {},
  ): Promise<T> {
    // First try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Distributed lock to prevent thundering herd
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;
    const lockTtl = 30 // 30 seconds;

    try {
      // Try to acquire lock
      const lockAcquired = await this.redis.set(lockKey, lockValue, 'PX', lockTtl * 1000, 'NX');
      
      if (!lockAcquired) {
        // If couldn't get lock, wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        
        // Try to get from cache again (maybe another process generated it)
        const cachedAfterWait = await this.get<T>(key);
        if (cachedAfterWait !== null) {
          return cachedAfterWait;
        }

        // If still doesn't exist, generate without lock (fallback)
        this.logger.warn(`Lock acquisition failed for key: ${key}, proceeding without lock`)
      }

      // Generate value
      const value = await factory();
      
      // Store in cache
      await this.set(key, value, options);
      
      return value;
    } catch (error) {
      this.logger.error(`Error in getOrSet for key: ${key}`, error)
      throw error;
    } finally {
      // Release lock if it was acquired by this process
      try {
        const currentLock = await this.redis.get(lockKey);
        if (currentLock === lockValue) {
          await this.redis.del(lockKey);
        }
      } catch (lockError) {
        this.logger.warn(`Error releasing lock for key: ${key}`, lockError)
      }
    }
  }

  /**
   * Cache with automatic refresh (read-through + refresh-ahead)
   */
  async getWithAutoRefresh<T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOptions & { refreshThreshold?: number } = {},
  ): Promise<T> {
    const { refreshThreshold = 0.8, ttl = 300 } = options;

    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      // Check if preventive refresh is needed
      const metadata = await this.redis.hgetall(`${key}:meta`);
      if (metadata.createdAt && metadata.expiresAt) {
        const age = Date.now() - parseInt(metadata.createdAt);
        const lifetime = parseInt(metadata.expiresAt) - parseInt(metadata.createdAt);
        const ageRatio = age / lifetime;

        if (ageRatio >= refreshThreshold) {
          // Asynchronous refresh to maintain performance
          setImmediate(async () => {
            try {
              const newValue = await factory();
              await this.set(key, newValue, options);
              this.logger.debug(`Background refresh completed for key: ${key}`)
            } catch (error) {
              this.logger.error(`Background refresh failed for key: ${key}`, error)
            }
          })
        }
      }

      return cached;
    }

    // Cache miss, generate value
    return this.getOrSet(key, factory, options);
  }

  /**
   * Force synchronization of a specific item
   */
  async forceSync(key: string): Promise<boolean> {
    try {
      // Get version from central server
      const serverVersion = await this.redis.hget('cache:versions', key);
      const localVersion = this.versionMap.get(key);

      if (serverVersion && serverVersion !== localVersion) {
        // Different versions, remove local cache to force regeneration
        await this.delete(key);
        this.logger.debug(`Forced sync completed for key: ${key}`)
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error in force sync for key: ${key}`, error)
      return false;
    }
  }

  /**
   * Smart invalidation with propagation
   */
  async smartInvalidate(pattern: string, options: { cascade?: boolean; delay?: number } = {}): Promise<void> {
    const { cascade = true, delay = 0 } = options;

    try {
      if (delay > 0) {
        // Delayed invalidation to allow propagation
        setTimeout(async () => {
          await this.performInvalidation(pattern, cascade);
        }, delay)
      } else {
        await this.performInvalidation(pattern, cascade);
      }
    } catch (error) {
      this.logger.error(`Error in smart invalidate for pattern: ${pattern}`, error)
      throw error;
    }
  }

  /**
   * Get advanced cache statistics
   */
  async getStats(): Promise<{
    redis: any
    local: any
    consistency: any
  }> {
    const info = await this.redis.info('memory');
    const dbSize = await this.redis.dbsize();
    const versions = await this.redis.hgetall('cache:versions');

    return {;
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
   * Clear all cache with confirmation
   */
  async clear(confirm: boolean = false): Promise<void> {
    if (!confirm) {
      throw new Error('Clear operation requires explicit confirmation');
    }

    try {
      await this.redis.flushdb();
      this.versionMap.clear()
      this.pendingInvalidations.clear()
      
      await this.publisher.publish('cache:invalidation', JSON.stringify({;
        pattern: '*',
        clearAll: true,
        timestamp: Date.now(),
      }))

      this.logger.warn('Cache completely cleared')
    } catch (error) {
      this.logger.error('Error clearing cache', error)
      throw error;
    }
  }

  /**
   * Setup eventual consistency system
   */
  private async setupEventualConsistency(): Promise<void> {
    await this.subscriber.subscribe('cache:invalidation', 'cache:changes');

    this.subscriber.on('message', async (channel, message) => {
      try {
        const event = JSON.parse(message);
        
        switch (channel) {
          case 'cache:invalidation':
            await this.handleInvalidationEvent(event);
            break
          case 'cache:changes':
            await this.handleChangeEvent(event);
            break
        }
      } catch (error) {
        this.logger.error(`Error processing pub/sub message from ${channel}`, error)
      }
    })

    this.logger.debug('Eventual consistency system initialized')
  }

  /**
   * Check if an item is eventually consistent
   */
  private isEventuallyConsistent(key: string, metadata: any): boolean {
    // If it's in the pending invalidations list, it's not consistent
    if (this.pendingInvalidations.has(key)) {
      return false;
    }

    // Check local version vs metadata
    const localVersion = this.versionMap.get(key);
    if (localVersion && localVersion !== metadata.version) {
      return false;
    }

    return true;
  }

  /**
   * Publish changes to other nodes
   */
  private async publishCacheChange(key: string, operation: string, data: any): Promise<void> {
    const event = {;
      key,
      operation,
      timestamp: Date.now(),
      nodeId: process.env.NODE_ID || 'unknown',
      data,
    }

    await this.publisher.publish('cache:changes', JSON.stringify(event));
  }

  /**
   * Process cache change events
   */
  private async handleChangeEvent(event: any): Promise<void> {
    const { key, operation, data, nodeId } = event;
    
    // Ignore own events
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
        // Remove from list after some time
        setTimeout(() => this.pendingInvalidations.delete(key), 5000)
        break
      case 'INVALIDATE_TAGS':
        // Mark items with these tags as pending invalidation
        for (const tag of data.tags) {
          const keys = await this.redis.smembers(`tag:${tag}`);
          keys.forEach(k => this.pendingInvalidations.add(k))
        }
        break
    }

    // Emit local event for other services
    this.eventEmitter.emit('cache.change', event)
  }

  /**
   * Process invalidation events
   */
  private async handleInvalidationEvent(event: any): Promise<void> {
    const { keys, pattern, tags } = event;

    if (keys) {
      await Promise.all(keys.map(key => this.delete(key)));
    } else if (pattern) {
      const matchingKeys = await this.redis.keys(pattern);
      await Promise.all(matchingKeys.map(key => this.delete(key)));
    } else if (tags) {
      await this.invalidateByTags(tags);
    }
  }

  /**
   * Perform invalidation with cascade
   */
  private async performInvalidation(pattern: string, cascade: boolean): Promise<void> {
    const keys = await this.redis.keys(pattern);
    
    if (cascade) {
      // Get all associated tags before deleting
      const allTags = new Set<string>();
      for (const key of keys) {
        const metadata = await this.redis.hgetall(`${key}:meta`);
        if (metadata.tags) {
          metadata.tags.split(',').forEach(tag => {
            if (tag.trim()) allTags.add(tag.trim())
          })
        }
      }

      // Delete keys
      await Promise.all(keys.map(key => this.delete(key)));

      // Cascade invalidate by tags
      if (allTags.size > 0) {
        await this.invalidateByTags(Array.from(allTags));
      }
    } else {
      await Promise.all(keys.map(key => this.delete(key)));
    }

    // Publish invalidation
    await this.publisher.publish('cache:invalidation', JSON.stringify({;
      pattern,
      keys,
      cascade,
      timestamp: Date.now(),
    }))
  }

  /**
   * Generate unique version for consistency control
   */
  private generateVersion(key: string): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate checksum for integrity verification
   */
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.subscriber.disconnect();
      await this.publisher.disconnect();
      this.logger.debug('Cache service disconnected')
    } catch (error) {
      this.logger.error('Error during cache service cleanup', error)
    }
  }
}
