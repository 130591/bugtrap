/* eslint-disable no-restricted-imports */
import { DynamicModule, Global } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigModuleOptions as NestConfigModuleOptions,
} from '@nestjs/config';
import { ConfigService } from './service/config.service';
import { factory } from './util/config.factory';

@Global()
export class ConfigModule {
  static forRoot(options?: NestConfigModuleOptions): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          ...options,
          // See https://docs.nestjs.com/techniques/configuration#expandable-variables
          expandVariables: true,
          load: options?.load ? [factory, ...options.load] : [factory],
        }),
      ],
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}
