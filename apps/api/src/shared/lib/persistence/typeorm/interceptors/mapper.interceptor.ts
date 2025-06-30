import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { MAPPER_KEY, MapperOptions } from '../decorators/mapper.decorator'
import { mapToDomain, mapToEntity } from './mapper.functions'


@Injectable()
export class MapperInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const target = context.getHandler()
    const options = this.reflector.get<MapperOptions>(MAPPER_KEY, target)

    if (!options) {
      return next.handle()
    }

    return next.handle().pipe(
      map((data) => {
        if (options.to === 'domain') {
          return mapToDomain(data)
        } else if (options.to === 'entity') {
          return mapToEntity(data)
        }
        return data
      }),
    )
  }
}
