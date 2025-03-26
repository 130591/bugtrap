import { NestFactory } from '@nestjs/core'
import { DataSource } from 'typeorm'
import { ConfigModule } from '@src/shared/config/config.module'
import { ConfigService } from '@src/shared/config/service/config.service'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { ENTITIES } from './entities'

const getDataSource = async () => {
  const configModule = await NestFactory.createApplicationContext(ConfigModule.forRoot())
  const configService = configModule.get<ConfigService>(ConfigService)
  return new DataSource(dataSourceOptionsFactory(configService))
}

export const dataSourceOptionsFactory = (
  configService: ConfigService
): PostgresConnectionOptions => ({
  type: 'postgres',
  name: 'identity',
  schema: 'bugtrap',
  host: configService.get('database').host,
  port: configService.get('database').port || 5432,
  username: configService.get('database').username,
  password: configService.get('database').password,
  database: configService.get('database').database,
  synchronize: true,
  entities: [...ENTITIES],
  migrations: ['api/identity/persistence/migration/*-migration.ts'],
  migrationsRun: false,
  migrationsTableName: 'identity_migrations',
  logging: false,
})

export default getDataSource