import { Injectable } from '@nestjs/common'
import { HealthIndicatorResult, TypeOrmHealthIndicator, MicroserviceHealthIndicator, HealthCheckService, HealthIndicator } from '@nestjs/terminus'
import { Transport } from '@nestjs/microservices'
import { ConfigService } from '@src/shared/config/service/config.service'
import { LoggerService } from '@src/shared/lib/logger'
import { ProjectRepository } from '@src/project/persist/repository'

interface Redis {
  ping(): Promise<string>
}

@Injectable()
export class ProjectHealthIndicator extends HealthIndicator {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly redis: Redis,
    private readonly healthCheckService: HealthCheckService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    private readonly microserviceHealthIndicator: MicroserviceHealthIndicator,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
  ) {
    super()
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check database connectivity
      await this.projectRepository.findMany({ take: 1 })
      
      // Check Redis connectivity  
      await this.redis.ping()

      const result = await this.healthCheckService.check([
        () => this.microserviceHealthIndicator.pingCheck('redis', {
          transport: Transport.REDIS,
          options: {
            host: this.config.get('redis').host,
            port: this.config.get('redis').port
          }
        }),
        () => this.typeOrmHealthIndicator.pingCheck('database', { connection: this.config.get('database').url as string })
      ])
      return this.getStatus(key, true, result)
    } catch (error) {
      this.logger.error('Project module health check failed', error.message)
      return this.getStatus(key, false, { [key]: { status: 'down', message: error.message } })
    }
  }
}
