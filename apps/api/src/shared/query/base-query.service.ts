import { Injectable } from '@nestjs/common'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { PaginationSpecification } from './specification/pagination-spec';
import { SortSpecification } from './specification/sorting-spec'
import { FilterSpecification } from './specification/filter-spec'

@Injectable()
export class BaseQueryService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async apply(params: any, aliasEntity: string) {
    const queryBuilder = await this.buildQuery(params, aliasEntity)
    return await this.executeQuery(queryBuilder, params.page, params.limit, params.accountId)
  }

  private async buildQuery(params: any, aliasEntity: string) {
    const { page = 1, limit = 12, orderBy = 'created_at', orderDirection = 'DESC', filters } = params
    
    const paginationSpec = new PaginationSpecification(page, limit)
    const sortSpec = new SortSpecification(aliasEntity, orderBy, orderDirection)
    const filterSpec = filters ? new FilterSpecification(filters) : null
  
    let queryBuilder: SelectQueryBuilder<T> = this.repository.createQueryBuilder(aliasEntity)
  
    queryBuilder = paginationSpec.apply(queryBuilder)
    queryBuilder = sortSpec.apply(queryBuilder)
  
    if (filterSpec) {
      queryBuilder = filterSpec.apply(queryBuilder)
    }
  
    return queryBuilder
  }

  private async executeQuery(queryBuilder: SelectQueryBuilder<T>, page: number, limit: number, target: string) {
    const [result, count] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount(),
    ]);
  
    const hasMore = count > page * limit
    const nextPage = hasMore ? page + 1 : null
    return { result, count, nextPage }
  }
}
