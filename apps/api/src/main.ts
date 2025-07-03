import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import xssClean from 'xss-clean'
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

  app.use(xssClean())
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.enableShutdownHooks()
  app.use( helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            'https://cdn.jsdelivr.net',
            'https://*.twilio.com',
            'https://*.sendgrid.com',
          ],
          connectSrc: [
            "'self'",
            'https://api.sendgrid.com',
            'https://api.twilio.com',
          ],
          imgSrc: ["'self'", 'data:', 'https://*.twilio.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }))

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  })
  
  const port = process.env.PORT || 3000
  await app.listen(port)
}

bootstrap()
