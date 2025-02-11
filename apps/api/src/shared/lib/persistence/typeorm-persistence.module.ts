import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {  initializeTransactionalContext } from 'typeorm-transactional';
import { ConfigModule } from '@src/shared/config/config.module';
import { ConfigService } from '@src/shared/config/service/config.service';
import { TypeOrmMigrationService } from './service/typeorm-migration.service';
import { DefaultEntity } from './entity/default.entity';

@Module({})
export class TypeOrmPersistenceModule {
  static forRoot(options: {
    migrations?: string[];
    entities?: Array<typeof DefaultEntity>;
  }): DynamicModule {
    initializeTransactionalContext();
    return {
      module: TypeOrmPersistenceModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule.forRoot()],
          inject: [ConfigService],
          useFactory: async (configService) => {
            return {
              type: 'postgres',
              logging: false,
              autoLoadEntities: false,
              synchronize: false,
              migrationsTableName: 'typeorm_migrations',
              ...configService.get('database'),
              ...options,
            };
          },
          // async dataSourceFactory(options) {
          //   if (!options) {
          //     throw new Error('Invalid options passed');
          //   }

          //   const dataSource = new DataSource(options);
          //   await dataSource.initialize();
            
          //   addTransactionalDataSource(dataSource);

          //   return dataSource;
          // },
        }),
      ],
      providers: [TypeOrmMigrationService],
      exports: [TypeOrmMigrationService],
    };
  }
}
