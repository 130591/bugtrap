import { randomUUID } from 'crypto'

export abstract class DomainEvent {
  public readonly occurredOn: Date
  public readonly eventId: string
  public readonly eventVersion: number

  constructor(
    public readonly aggregateId: string,
    eventVersion: number = 1
  ) {
    this.occurredOn = new Date()
    this.eventId = randomUUID()
    this.eventVersion = eventVersion
  }

  abstract getEventName(): string
}
