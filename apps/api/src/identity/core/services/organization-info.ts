import { Injectable } from '@nestjs/common'
import { OrganizationQueryService } from '@src/identity/persist/queries/organization-query'

interface OrganizationQueryInput {
  filters: object;
  page: number;
  limit: number;
  orderBy: string;
  orderDirection: 'ASC' | 'DESC';
}

@Injectable()
export class ListOrganizationService {
	constructor(
		private readonly query: OrganizationQueryService,
	) {}

	async execute(command: OrganizationQueryInput) {
	  return await this.query.apply(command, 'organizations')
	}
}