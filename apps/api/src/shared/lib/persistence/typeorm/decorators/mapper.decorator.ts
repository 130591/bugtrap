import { SetMetadata, applyDecorators, UseInterceptors } from '@nestjs/common'
import { MapperInterceptor } from '../interceptors/mapper.interceptor'


export const MAPPER_KEY = 'mapper'

export interface MapperOptions {
  to: 'domain' | 'entity';
}

export const Mapper = (options: MapperOptions) =>
  applyDecorators(
    SetMetadata(MAPPER_KEY, options),
    UseInterceptors(MapperInterceptor),
  )

