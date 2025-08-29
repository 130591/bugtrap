import { Controller, Get } from '@nestjs/common'
import { HealthCheckService, HealthCheck } from '@nestjs/terminus'
import { ProjectHealthIndicator } from './project-health.indicator'

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly projectHealth: ProjectHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.projectHealth.isHealthy('project-module')
    ])
  }
}
