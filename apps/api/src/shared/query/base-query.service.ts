import { Injectable, Logger } from '@nestjs/common'
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm'
import { PaginationSpecification } from './specification/pagination-spec';
import { SortSpecification } from './specification/sorting-spec'
import { FilterSpecification } from './specification/filter-spec'
import { ApplicationException } from '../exception/application.exception';

@Injectable()
export class BaseQueryService<T> {
  protected repository: Repository<T>

  private readonly logger = new Logger(BaseQueryService.name)

  constructor(protected readonly dataSource: DataSource, entity: { new (...args: any[]): T }) {
    this.repository = this.dataSource.getRepository(entity)
  }

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
    queryBuilder = this.applyJoins(queryBuilder, aliasEntity)

    queryBuilder = paginationSpec.apply(queryBuilder)
    queryBuilder = sortSpec.apply(queryBuilder)
  
    if (filterSpec) queryBuilder = filterSpec.apply(queryBuilder)

    return queryBuilder
  }

  private applyJoins(queryBuilder: SelectQueryBuilder<T>, aliasEntity: string): SelectQueryBuilder<T> {
    const entityMetadata = this.repository.metadata

    entityMetadata.relations.forEach(relation => {
      const relationAlias = `${aliasEntity}.${relation.propertyName}`
      const relationJoinAlias = `${relation.propertyName}Alias`

      if (relation.isManyToOne || relation.isOneToOne) {
        queryBuilder = queryBuilder.leftJoinAndSelect(relationAlias, relationJoinAlias)
      } else if (relation.isOneToMany || relation.isManyToMany) {
        queryBuilder = queryBuilder.leftJoinAndSelect(relationAlias, relationJoinAlias)
      }
    })

    return queryBuilder
  }

  private async executeQuery(queryBuilder: SelectQueryBuilder<T>, page: number, limit: number, target: string) {
   try {
    const [result, count] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount(),
    ]);
  
    const hasMore = count > page * limit
    const nextPage = hasMore ? page + 1 : null
    return { result, count, nextPage }
   } catch (error) {
    this.logger.error(`Database Error: ${error.message}`, error.stack)

    throw new ApplicationException({
      message: 'Something went wrong, please try again later.',
      suggestedHttpStatusCode: 500,
      context: 'Database Operation',
      origin: error.stack
    })
   }
  }
}
