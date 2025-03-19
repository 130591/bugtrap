import { Injectable } from '@nestjs/common'
import { InviteEvent } from '@src/shared/event'
import { QueueService, OnDomainEvent } from '@src/shared/lib/hive'

@Injectable()
export class InvitationMemberListener {
	constructor(private readonly queueService: QueueService) {}

	@OnDomainEvent(InviteEvent.CONFIRM_INVITATION)
	async handleOrderCreatedEvent(event: any) {
		this.queueService.addJob('send.intitation.confirm.mailer', event)
	}
}