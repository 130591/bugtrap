import { Injectable } from "@nestjs/common"
import { ProjectQueryService } from '@src/project/persist/queries'

@Injectable()
export class ListService {
	constructor(
		private readonly query: ProjectQueryService
	) {}

	async execute(params: any) {
		return await this.query.apply(params, 'project')
	}
}