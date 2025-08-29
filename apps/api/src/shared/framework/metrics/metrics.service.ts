import { Injectable } from '@nestjs/common'

@Injectable()
export class MetricsService {
  incrementCounter(name: string, tags: Record<string, string> = {}): void {
    // Implementation depends on your metrics provider (Prometheus, etc.)
    console.log(`Metric: ${name}`, tags)
  }
}