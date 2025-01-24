import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmPersistenceModule } from '@src/shared/lib/persistence/typeorm-persistence.module';
import { ENTITIES } from './entities';

@Module({})
export class PersistenceModule {
  static forRoot(opts?: { migrations?: string[] }): DynamicModule {
    const { migrations } = opts || {};

    return {
      module: PersistenceModule,
      imports: [
        TypeOrmPersistenceModule.forRoot({
          migrations,
          entities: [...ENTITIES],
        }),
      ],
      providers: [
      ],
      exports: [
      ],
    };
  }
}
