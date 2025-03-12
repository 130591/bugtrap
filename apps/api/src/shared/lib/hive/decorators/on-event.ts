import 'reflect-metadata'
import { applyDecorators, SetMetadata } from '@nestjs/common'

export const OnDomainEvent = (event: string): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    return applyDecorators(SetMetadata('domain:event', event))(target, propertyKey, descriptor)
  }
}


