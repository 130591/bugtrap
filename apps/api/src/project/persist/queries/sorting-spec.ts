import { SelectQueryBuilder } from "typeorm"

export class SortSpecification {
  constructor(private readonly field: string, private readonly direction: 'ASC' | 'DESC') {}

  apply(queryBuilder: SelectQueryBuilder<any>) {
    if (this.field && this.direction) {
      queryBuilder.orderBy(`project.${this.field}`, this.direction)
    }
    return queryBuilder
  }
}