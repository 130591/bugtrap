import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { ENTITIES } from './entities'
import { ConfigService } from '@src/shared/config/service/config.service'

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