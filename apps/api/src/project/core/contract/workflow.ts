export interface WorkflowRule {
	id: string
	name: string
	projectId: string;
	trigger: WorkflowTrigger
	conditions: WorkflowCondition[]
	actions: WorkflowAction[]
	createdAt: Date
	active: boolean
}

export type WorkflowTrigger =
	| { type: 'COMMENT_ADDED'; projectId: string }
	| { type: 'PROJECT_CREATED' }
	| { type: 'DATE_TIME'; timestamp: string }

export interface WorkflowCondition {
	field: string
	operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN'
	value: string
}

export interface WorkflowAction {
	type: 'UPDATE_STATUS' | 'NOTIFY_USER' | 'ASSIGN_USER'
	payload: any // Ex: { status: 'Em Progresso' }
}
