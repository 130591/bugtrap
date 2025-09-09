import { Injectable } from '@nestjs/common';
import { CacheService } from './cache-service';

export enum ConsistencyStrategy {
  STRONG = 'strong',
  EVENTUAL = 'eventual',
  WEAK = 'weak',
}

export interface StrategyConfig {
  strategy: ConsistencyStrategy;
  syncInterval?: number;
  toleranceMs?: number;
  autoSync?: boolean;
}

@Injectable()
export class CacheConsistencyManager {
  private strategies = new Map<string, StrategyConfig>();

  constructor(private readonly cacheService: CacheService) {}

  setStrategy(keyPattern: string, config: StrategyConfig): void {
    this.strategies.set(keyPattern, config)
  }

  async applyConsistencyCheck(key: string): Promise<boolean> {
    const strategy = this.findMatchingStrategy(key);
    
    if (!strategy) {
      return true; // No strategy = allow
    }

    switch (strategy.strategy) {
      case ConsistencyStrategy.STRONG:
        return this.checkStrongConsistency(key);
      case ConsistencyStrategy.EVENTUAL:
        return this.checkEventualConsistency(key, strategy.toleranceMs || 5000);
      case ConsistencyStrategy.WEAK:
        return true; // Always allow
      default:
        return true;
    }
  }

  private findMatchingStrategy(key: string): StrategyConfig | null {
    for (const [pattern, config] of this.strategies.entries()) {
      if (this.matchPattern(key, pattern)) {
        return config;
      }
    }
    return null;
  }

  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(key);
  }

  private async checkStrongConsistency(key: string): Promise<boolean> {
    // For strong consistency, force synchronization
    return this.cacheService.forceSync(key);
  }

  private async checkEventualConsistency(key: string, toleranceMs: number): Promise<boolean> {
    // Check if inconsistency is within tolerance
    const metadata = await this.cacheService['redis'].hgetall(`${key}:meta`);
    if (!metadata.createdAt) {
      return true;
    }

    const age = Date.now() - parseInt(metadata.createdAt);
    return age <= toleranceMs;
  }
}