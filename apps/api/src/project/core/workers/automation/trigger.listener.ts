import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Injectable, Logger } from '@nestjs/common'
import { WorkFlowRepository } from '@src/project/persist/repository/workflow.repository'
import { BrokerService } from '@src/shared/module/broker/broker.service'


@Injectable()
export class TiggerObserver {
	private readonly logger = new Logger(TiggerObserver.name)

	constructor(
	  private readonly broker: BrokerService, 
		private readonly repository: WorkFlowRepository
	) {}

	private checkConditions(conditions: any, event: any): boolean {
		if (!conditions || conditions.length === 0) return true;

		return conditions.every(condition => {
			const eventValue = event[condition.field];
	
			switch (condition.operator) {
				case 'equals':
					return eventValue === condition.value;
				case 'not_equals':
					return eventValue !== condition.value;
				case 'contains':
					return Array.isArray(eventValue) && eventValue.includes(condition.value)
				case 'not_empty':
					return eventValue !== undefined && eventValue !== null && eventValue !== ''
				default:
					return false
			}
		})
	}

	private resolveRoutingKey(type: string): string | null {
		switch (type) {
			case 'send_email':
				return 'automation.send_email';
			case 'notify_slack':
				return 'automation.notify_slack';
			default:
				return null;
		}
	}

	private async runActions(actions: any[], event) {
		for (const action of actions) {
			const payload = {
				action,
				event,
			};
	
			const routingKey = this.resolveRoutingKey(action.type)
	
			if (routingKey) {
				await this.broker.emit('exchange.automation', routingKey, payload)
			} else {
				this.logger.warn(`Unknown action type: ${action.type}`)
			}
		}
	}

	@RabbitSubscribe({
		exchange: 'exchange.project',
    routingKey: '#',
    queue: 'queue.automation'
	})
	async onAnyProjectEvent(msg: any, amqpMsg: any) {
		const routingKey = amqpMsg.fields.routingKey
		const projectId = msg.projectId

		this.logger.log(`Evento recebido: ${routingKey} para projeto ${projectId}`)

		const automations = await this.repository.findMany({ 
			where: { 
				project_id: projectId, 
				trigger_event: routingKey
			}
		})

		for (const automation of automations) {
			if (this.checkConditions(automation.conditions, msg)) {
				await this.runActions(automation.actions, msg)
			}
		}
	}
}
