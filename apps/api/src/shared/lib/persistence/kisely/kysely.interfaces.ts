import { KyselyConfig } from 'kysely'
import { ModuleMetadata, Type } from '@nestjs/common'

export interface KyselyModuleOptions extends KyselyConfig {}

export interface KyselyModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<KyselyModuleOptions> | KyselyModuleOptions
  inject?: (Type<any> | string | symbol)[]
}