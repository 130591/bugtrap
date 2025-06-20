import { Inject, Injectable } from '@nestjs/common'
import { KYSELY_CONNECTION } from '@src/shared/lib/persistence/kisely/kysely.constants'
import { DB } from '@src/shared/lib/persistence/kisely/types'
import { SearchCommand } from './commands'

@Injectable()
export class SearchService {
	constructor(@Inject(KYSELY_CONNECTION) private readonly db: DB) {}

	async execute(command: SearchCommand) {
		const { searchTerm } = command
		
		if (!searchTerm) {
			return {
			  count: 1, 
			  result:  [], 
			  nextPage: 1
		  }
		}

		const tsQuery = this.db.fn.call('plainto_tsquery', 'portuguese', searchTerm)
		const projects = await this.db
			.selectFrom('projects')
			.where('search_vector', '@@', tsQuery)
			.selectAll()
			.execute()
    
		return {
			count: 1, 
			result: projects, 
			nextPage: 1
		}
	}
}