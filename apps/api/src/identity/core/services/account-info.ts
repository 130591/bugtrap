import { Injectable } from '@nestjs/common'
import { AccountQueryService } from '@src/identity/persist/queries'

interface ListAccountInput {
  filters: object;
  page: number;
  limit: number;
  orderBy: string;
  orderDirection: 'ASC' | 'DESC';
}

@Injectable()
export class ListAccountService {
	constructor(
		private readonly query: AccountQueryService,
	) {}

	async execute(command: ListAccountInput) {
	  return await this.query.apply(command, 'accounts')
	}
}