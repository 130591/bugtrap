import { Injectable, Logger } from '@nestjs/common'
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { DomainEvent } from './domain-event.base'

@Injectable()
export class EventPublisher {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly logger: Logger,
  ) {}

  async publish(event: DomainEvent, routingKey?: string): Promise<void> {
    try {
      const eventPayload = {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        occurredOn: event.occurredOn,
        eventVersion: event.eventVersion,
        eventName: event.getEventName(),
        payload: event
      }

      const exchange = 'domain.events'
      const key = routingKey || event.getEventName()

      await this.amqpConnection.publish(exchange, key, eventPayload, {
        persistent: true,
        messageId: event.eventId,
        timestamp: event.occurredOn.getTime(),
        headers: {
          'event-type': event.getEventName(),
          'aggregate-id': event.aggregateId,
          'event-version': event.eventVersion.toString()
        }
      })

      this.logger.log('Domain event published', {
        who: 'system_process',
        where: 'EventPublisher.publish',
        what: 'domain_event_published',
        eventName: event.getEventName(),
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        exchange,
        routingKey: key
      })
    } catch (error) {
      this.logger.error('Failed to publish domain event', {
        who: 'system_process',
        where: 'EventPublisher.publish',
        what: 'domain_event_publish_failed',
        why: error.message,
        eventName: event.getEventName(),
        eventId: event.eventId,
        stack: error.stack
      })
      throw error
    }
  }

  async publishBatch(events: DomainEvent[], routingKey?: string): Promise<void> {
    const publishPromises = events.map(event => this.publish(event, routingKey))
    
    try {
      await Promise.all(publishPromises)
      
      this.logger.log('Batch of domain events published', {
        who: 'system_process',
        where: 'EventPublisher.publishBatch',
        what: 'domain_events_batch_published',
        eventCount: events.length,
        eventIds: events.map(e => e.eventId)
      })
    } catch (error) {
      this.logger.error('Failed to publish batch of domain events', {
        who: 'system_process',
        where: 'EventPublisher.publishBatch',
        what: 'domain_events_batch_failed',
        why: error.message,
        eventCount: events.length
      })
      throw error
    }
  }

  // Para compatibilidade com código existente
  async emit(exchange: string, routingKey: string, data: any): Promise<void> {
    try {
      await this.amqpConnection.publish(exchange, routingKey, data, {
        persistent: true,
        timestamp: Date.now()
      })

      this.logger.log('Message published to RabbitMQ', {
        who: 'system_process',
        where: 'EventPublisher.emit',
        what: 'message_published',
        exchange,
        routingKey
      })
    } catch (error) {
      this.logger.error('Failed to publish message to RabbitMQ', {
        who: 'system_process',
        where: 'EventPublisher.emit',
        what: 'message_publish_failed',
        why: error.message,
        exchange,
        routingKey
      })
      throw error
    }
  }
}