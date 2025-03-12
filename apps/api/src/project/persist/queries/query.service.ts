import { Injectable } from '@nestjs/common'
import { ProjectRepository } from '@src/project/persist/repository'
import { PaginationSpecification } from './pagination-spec'
import { FilterSpecification } from './filter-spec'
import { SortSpecification } from './sorting-spec'

@Injectable()
export class QueryService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async apply(params: any, aliasEntity) {
    const queryBuilder = await this.buildQuery(params, aliasEntity)
    return await this.executeQuery(queryBuilder)
  }

  private async buildQuery(params: any, aliasEntity: string) {
    const { page = 1, limit = 12, orderBy = 'created_at', orderDirection = 'DESC', filters } = params
  
    const paginationSpec = new PaginationSpecification(page, limit)
    const sortSpec = new SortSpecification(orderBy, orderDirection)
    const filterSpec = filters ? new FilterSpecification(filters) : null
  
    let queryBuilder = await this.projectRepository.getQueryBuilder(aliasEntity)
  
    queryBuilder = paginationSpec.apply(queryBuilder)
    queryBuilder = sortSpec.apply(queryBuilder)
  
    if (filterSpec) {
      queryBuilder = filterSpec.apply(queryBuilder)
    }
  
    return queryBuilder
  }
  

  private async executeQuery(queryBuilder: any) {
    const [result, count] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount(),
    ]);
    return { result, count }
  }
}
