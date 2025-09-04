import { Injectable } from '@nestjs/common'
import { EventPublisher } from '@src/shared/framework/events'
import { DomainEvent } from '@src/shared/framework/events'

@Injectable()
export class BrokerService {
  constructor(
    private readonly eventPublisher: EventPublisher,
  ) {}

  async emit<T>(exchange: string, routingKey: string, data: T): Promise<void> {
    // Create a generic domain event for backward compatibility
    const event = new GenericDomainEvent(routingKey, data, exchange)
    await this.eventPublisher.publish(event)
  }
}

// Generic domain event for backward compatibility with existing BrokerService usage
class GenericDomainEvent extends DomainEvent {
  constructor(
    public readonly eventType: string,
    public readonly data: any,
    public readonly exchange?: string
  ) {
    // Use a generic aggregateId for backward compatibility
    super(data?.id || data?.aggregateId || 'unknown', 1)
  }

  getEventName(): string {
    return this.eventType
  }

  getPayload(): any {
    return this.data
  }

  getExchange(): string {
    return this.exchange || 'domain.events'
  }

  getRoutingKey(): string {
    return this.eventType
  }
}
