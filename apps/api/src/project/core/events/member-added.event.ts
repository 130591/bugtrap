import { DomainEvent } from '@src/shared/framework/events/domain-event.base'

export class MemberAddedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly membersId: string[],
    public readonly addedBy: string,
    public readonly addedCount: number,
    public readonly failedCount: number = 0
  ) {
    super(projectId, 1)
  }

  getEventName(): string {
    return 'project.member.added'
  }

  getPayload(): any {
    return {
      projectId: this.projectId,
      membersId: this.membersId,
      addedBy: this.addedBy,
      addedCount: this.addedCount,
      failedCount: this.failedCount,
      timestamp: this.occurredOn
    }
  }

  getExchange(): string {
    return 'domain.events'
  }

  getRoutingKey(): string {
    return 'project.member.added'
  }
}
