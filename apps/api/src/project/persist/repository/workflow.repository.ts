import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import { DefaultTypeOrmRepository } from '@src/shared/lib/persistence/typeorm/repository/default-type.repository'
import { WorkflowEntity } from '../entities/workflow-rule.entity'


interface CommandWorkflow {}

@Injectable()
export class WorkFlowRepository extends DefaultTypeOrmRepository<WorkflowEntity> {
	constructor(
		@InjectDataSource('project')
		dataSource: DataSource
	) {
		super(WorkflowEntity, dataSource.manager)
	}

	@Transactional()
	async persist(command: CommandWorkflow) {
	}
}
