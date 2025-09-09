import { SetMetadata } from '@nestjs/common';
import { CacheService } from '../core/cache-service';

export const CACHE_KEY = 'cache:key';
export const CACHE_TTL = 'cache:ttl';
export const CACHE_TAGS = 'cache:tags';

export const Cache = (options: {
  key?: string;
  ttl?: number;
  tags?: string[];
  keyGenerator?: (...args: any[]) => string;
}) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, options.key || propertyKey)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL, options.ttl || 300)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TAGS, options.tags || [])(target, propertyKey, descriptor);

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService: CacheService = this.cacheService;

      if (!cacheService) {
        return originalMethod.apply(this, args);
      }

      const key = options.keyGenerator ? options.keyGenerator(...args) : `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;

      return cacheService.getOrSet(
        key,
        () => originalMethod.apply(this, args),
        {
          ttl: options.ttl || 300,
          tags: options.tags || [],
        },
      );
    };

    return descriptor;
  };
};

export const CacheEvict = (options: {
  keys?: string[];
  tags?: string[];
  pattern?: string;
  allEntries?: boolean;
}) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      const cacheService: CacheService = this.cacheService;

      if (cacheService) {
        if (options.allEntries) {
          await cacheService.clear(true);
        } else if (options.tags) {
          await cacheService.invalidateByTags(options.tags);
        } else if (options.pattern) {
          await cacheService.smartInvalidate(options.pattern);
        } else if (options.keys) {
          await Promise.all(options.keys.map(key => cacheService.delete(key)));
        }
      }

      return result;
    };

    return descriptor;
  };
};
