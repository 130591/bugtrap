export interface ApiResponse<T> {
  success: boolean
  data: T
  isArray?: boolean
  isPaginated?: boolean
  isSorted?: boolean
  pagination?: {
    minLimit: number
    maxLimit: number
    defaultLimit: number
    limit: number
    offset: number
    total: number
  }
  sorting?: Record<string, any>
}
