import { Injectable } from '@nestjs/common'
import { ProjectEvent } from '@src/shared/event'
import { QueueService, OnDomainEvent } from '@src/shared/lib/hive'

@Injectable()
export class CreateProjectListener {
  constructor(private readonly queueService: QueueService) {}

  @OnDomainEvent(ProjectEvent.CREATED)
  async handleOrderCreatedEvent(event: any) {
    await this.queueService.addJob('order-confirmation-email', event)
    await this.queueService.addJob('order-stock-update', event)
  }
}