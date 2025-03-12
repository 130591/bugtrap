export const OnQueueDlq = (queue: string): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata('queue:dlq', queue, descriptor.value)
  }
}