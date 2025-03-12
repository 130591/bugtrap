import { Injectable } from "@nestjs/common"
import { QueryService } from "@src/project/persist/queries/query.service"

@Injectable()
export class ListService {
	constructor(
		private readonly query: QueryService
	) {}

	async execute(params: any) {
		try {
			return await this.query.apply(params, 'project')
		} catch (error) {
			console.log('error:', error)
		}
	}
}