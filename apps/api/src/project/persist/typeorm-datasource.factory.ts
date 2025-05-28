import { ConfigService } from '@src/shared/config/service/config.service'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { ENTITIES } from './entities'

export const dataSourceOptionsFactory = (
	configService: ConfigService
): PostgresConnectionOptions => ({
	type: 'postgres',
	name: 'project',
	schema: 'bugtrap',
	host: configService.get('database').host,
	port: configService.get('database').port || 5432,
	username: configService.get('database').username,
	password: configService.get('database').password,
	database: configService.get('database').database,
	synchronize: false,
	entities: [...ENTITIES],
	migrations: ['apps/api/project/persist/migrations/*-migration.ts'],
	migrationsRun: false,
	migrationsTableName: 'project_migrations',
	logging: false,
})