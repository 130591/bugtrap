import { DiscoveryService } from '@golevelup/nestjs-discovery'
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import Redis from 'ioredis'

interface DomainEventHandler {
	instance: any
	methodName: string
	event: string
}

@Injectable()
export class RedisSubscriberService  implements OnApplicationBootstrap  {
	private subscriber: Redis
	private eventHandlers: DomainEventHandler[] = []

	constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    @Inject('REDIS_SUBSCRIBER') private readonly redis: Redis,
  ) {}

	async onApplicationBootstrap() {
		this.subscriber = this.redis
    if (!this.subscriber) throw new Error('Redis connection not initialized')

    const providers = await this.discoveryService.providerMethodsWithMetaAtKey('domain:event')
		providers.forEach(async ({ meta, discoveredMethod }) => {
			if (!discoveredMethod) return
      const methodName = discoveredMethod.methodName
  
			if (meta) {
        const handlerInstance = discoveredMethod.parentClass.instance || discoveredMethod.parentClass
       
        const boundHandler = discoveredMethod.handler.bind(handlerInstance)
				this.eventHandlers.push({
					instance: async (eventData) => {
            await boundHandler(eventData)
          },
					methodName,
					event: meta as string,
				})
			}

    const channels = [...new Set(this.eventHandlers.map(handler => handler.event))]

    for (const channel of channels) {
      await this.subscriber.subscribe(channel)
    }
   
    this.subscriber.on('message', async (channel, message) => {
      try {
        const eventData = JSON.parse(message);
        this.eventHandlers.forEach(handler => {
          if (handler.event === channel) handler.instance(eventData)
        })
      } catch (error) {
        console.log(`[RedisSubscriber] Error processing message`, error)
      }
    })
	})
 }
}