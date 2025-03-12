export const OnQueueJob = (queue: string): MethodDecorator => {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata('queue:job', queue, descriptor.value)
  }
}