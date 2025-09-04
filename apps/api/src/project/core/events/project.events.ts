import { DomainEvent } from "@src/shared/framework"

export class ProjectCreatedEvent extends DomainEvent {

  constructor(
    public readonly aggregateId: string,
    public readonly projectName: string,
    public readonly ownerId: string
  ) {
    super(aggregateId)
  }

  getEventName(): string {
    return "project.created"
  }
}