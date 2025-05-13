import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { BrokerService } from '@src/shared/module/broker/broker.service'
import { WorkflowAction, WorkflowCondition, WorkflowRule, WorkflowTrigger } from '../contract'
import { WorkFlowRepository } from '@src/project/persist/repository/workflow.repository'

export interface CreateWorkflowRuleCommand {
	projectId: string
	name: string
	trigger: WorkflowTrigger
	conditions: WorkflowCondition[]
	actions: WorkflowAction[]
}

@Injectable()
export class CreateWorkFlowRuleService {
	constructor(
		private readonly event: BrokerService,
		private readonly repository: WorkFlowRepository,
	) {}

	private validateConditions(conditions: WorkflowCondition[]) {
		conditions.forEach(condition => {
			if (!condition.field || !condition.operator || !condition.value) {
				throw new Error('Condição inválida')
			}
		})
	}

	private validateActions(actions: WorkflowAction[]) {
		actions.forEach(action => {
			if (!action.type || !action.payload) {
				throw new Error('Ação inválida')
			}
		})
	}

	@Transactional()
	async execute(command: CreateWorkflowRuleCommand) {
		this.validateConditions(command.conditions)
		this.validateActions(command.actions)

		const rule: WorkflowRule = {
			id: randomUUID(),
			projectId: command.projectId,
			name: command.name,
			trigger: command.trigger,
			conditions: command.conditions,
			actions: command.actions,
			active: true,
			createdAt: new Date()
		}

		await this.repository.persist(rule)
		this.event.emit('project', 'created.rule', rule)
		return rule
	}
}
