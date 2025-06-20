// src/shared/lib/persistence/kisely/kysely.module.ts
import { DynamicModule, Module, Provider, Global, OnModuleDestroy, Inject, Logger } from '@nestjs/common'
import { KyselyModuleAsyncOptions, KyselyModuleOptions } from './kysely.interfaces'
import { KYSELY_CONNECTION, KYSELY_OPTIONS } from './kysely.constants'
import { DB } from './types'

@Global()
@Module({})
export class KyselyModule implements OnModuleDestroy {
  private readonly logger = new Logger(KyselyModule.name)
  
  constructor(@Inject(KYSELY_CONNECTION) private readonly connection: DB) {}

  static forRoot(options: KyselyModuleOptions): DynamicModule {
    const kyselyOptionsProvider: Provider = {
      provide: KYSELY_OPTIONS,
      useValue: options,
    };

    const kyselyConnectionProvider: Provider = {
      provide: KYSELY_CONNECTION,
      useFactory: (opts: KyselyModuleOptions) => {
        return new DB(opts)
      },
      inject: [KYSELY_OPTIONS],
    }

    return {
      module: KyselyModule,
      providers: [kyselyOptionsProvider, kyselyConnectionProvider],
      exports: [kyselyConnectionProvider],
    }
  }

  static forRootAsync(options: KyselyModuleAsyncOptions): DynamicModule {
    const kyselyConnectionProvider: Provider = {
      provide: KYSELY_CONNECTION,
      useFactory: async (...args: any[]) => {
        const kyselyOptions = await options.useFactory(...args)
        return new DB(kyselyOptions)
      },
      inject: options.inject || [],
    }

    return {
      module: KyselyModule,
      imports: options.imports || [],
      providers: [
        kyselyConnectionProvider
      ],
      exports: [kyselyConnectionProvider],
    }
  }

  async onModuleDestroy() {
    if (this.connection) {
      this.logger.log('Closing connection Kysely...')
      await this.connection.destroy()
      this.logger.log('Kysely connection closed.')
    }
  }
}