import { Injectable } from '@nestjs/common'
import { UserQueryService } from '@src/identity/persist/queries'

interface ListUserInput {
	userId: string;
	page: number;
	limit: number;
	orderBy: string;
	orderDirection: 'ASC' | 'DESC';
}

@Injectable()
export class ListUserService {
	constructor(
		private readonly query: UserQueryService,
	) {}

	async execute(command: ListUserInput) {
		return await this.query.apply(command, 'users')
	}
}