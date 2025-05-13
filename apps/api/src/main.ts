import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { initializeTransactionalContext, addTransactionalDataSource } from 'typeorm-transactional'
import { DataSource } from 'typeorm'
import { AppModule } from './app.module'
import { ConfigService } from './shared/config/service/config.service'
import { setupSwagger } from './shared/framework/swagger'

function buildOpt(configService) {
  return {
    type: 'postgres',
    logging: false,
    autoLoadEntities: false,
    synchronize: false,
    migrationsTableName: 'typeorm_migrations',
    ...configService.get('database'),
  }
}

async function bootstrap() {
  initializeTransactionalContext()
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService) as Record<string, any>
  const options = buildOpt(configService)
  const dataSource = new DataSource(options)
  await dataSource.initialize()

  addTransactionalDataSource(dataSource)
  setupSwagger(app)

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.enableShutdownHooks()

  app.enableCors({
    origin: '*',
    credentials: true,
  })
  
  const port = process.env.PORT || 3000
  await app.listen(port)
}

bootstrap()
