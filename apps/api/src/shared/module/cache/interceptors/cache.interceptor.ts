import {;
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../core/cache-service';

@Injectable()
export class ConsistentCacheInterceptor implements NestInterceptor {;
  constructor(private readonly cacheService: CacheService) {};

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const userId = request.user?.id;

    if (method !== 'GET') {
      return next.handle().pipe(;
        tap(() => {
          // Invalidate related caches in modification operations
          this.invalidateRelatedCaches(url, method, userId)
        }),
      )
    }

    const cacheKey = this.generateCacheKey(url, userId);
    
    return new Observable(observer => {;
      this.cacheService.getWithAutoRefresh(
        cacheKey,
        async () => {
          return new Promise((resolve, reject) => {;
            next.handle().subscribe({
              next: resolve,
              error: reject,
              complete: () => {},
            })
          });
        },
        {
          ttl: 300,
          tags: this.extractTagsFromUrl(url),
          refreshThreshold: 0.7,
        },
      ).then(result => {
        observer.next(result)
        observer.complete()
      }).catch(error => {
        observer.error(error)
      })
    });
  }

  private generateCacheKey(url: string, userId?: string): string {
    const baseKey = `http:GET:${url}`;
    return userId ? `${baseKey}:user:${userId}` : baseKey;
  }

  private extractTagsFromUrl(url: string): string[] {
    const tags = ['http'];
    
    // Extract entities from URL for intelligent tagging
    const segments = url.split('/').filter(s => s);
    if (segments.length > 0) {
      tags.push(`entity:${segments[0]}`)
    }

    return tags;
  }

  private async invalidateRelatedCaches(url: string, method: string, userId?: string): Promise<void> {
    const tags = this.extractTagsFromUrl(url);
    
    // Invalidation strategy based on HTTP method
    switch (method) {
      case 'POST':
        // Invalidate lists and related caches
        await this.cacheService.invalidateByTags([...tags, 'list']);
        break
      case 'PUT':
      case 'PATCH':
        // Invalidate specific item and lists
        const entityId = this.extractEntityId(url);
        if (entityId) {
          await this.cacheService.delete(`entity:${entityId}`);
        }
        await this.cacheService.invalidateByTags([...tags, 'list']);
        break
      case 'DELETE':
        // Cascade invalidation
        await this.cacheService.smartInvalidate(`*${url}*`, { cascade: true });
        break
    }
  }

  private extractEntityId(url: string): string | null {
    const match = url.match(/\/([a-f\d-]{36}|\d+)(?:\/|$)/i);
    return match ? match[1] : null;
  }
}
