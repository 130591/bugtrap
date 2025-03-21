import { DynamicModule, Module } from '@nestjs/common'
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'

@Module({})
export class TypeOrmPersistenceModule {
  static forRoot(options: TypeOrmModuleAsyncOptions): DynamicModule {
    return {
      module: TypeOrmPersistenceModule,
      exports: [TypeOrmModule],
      imports: [TypeOrmModule.forRootAsync(options)],
    };
  }
}