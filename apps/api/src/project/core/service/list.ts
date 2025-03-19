import { Injectable } from "@nestjs/common"
import { ProjectQueryService } from '@src/project/persist/queries'

@Injectable()
export class ListService {
	constructor(
		private readonly query: ProjectQueryService
	) {}

	async execute(params: any) {
		try {
			return await this.query.apply(params, 'project')
		} catch (error) {
			console.log('error:', error)
		}
	}
}