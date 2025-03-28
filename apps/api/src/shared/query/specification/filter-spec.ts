export class FilterSpecification {
  private readonly filters: any

  constructor(filters: any) {
    this.filters = filters
  }

  apply(query: any) {
    Object.keys(this.filters).forEach((key) => {
      query = query.andWhere(`${query.alias}.${key} = :${key}`, { [key]: this.filters[key] })
    });
    return query
  }
}
