export class PaginationSpecification {
  private readonly page: number
  private readonly limit: number

  constructor(page: number, limit: number) {
    this.page = page
    this.limit = limit
  }

  apply(query: any) {
    const skip = (this.page - 1) * this.limit
    return query.skip(skip).take(this.limit)
  }
}
