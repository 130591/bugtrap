import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { FilteringDto } from "../dto/filtering.dto"
import { PaginationDto } from "../dto/pagination.dto"
import { SortingDto } from "../dto/sorting.dto"
import { STANDARD_RESPONSE_MESSAGE_KEY } from "../response.constants"
import { getPagination, getSorting } from "../functions"
import { getFiltering } from "../functions/get-filtering"

type SettablePaginationInfo = Pick<
  PaginationDto,
  'count' | 'limit' | 'offset' | 'nextPage'
>;
type SettableSortingInfo = Pick<SortingDto, 'sort'>
type SettableFilteringInfo = Pick<FilteringDto, 'filter'>
export interface PaginationParams {
  paginationInfo: PaginationDto;
  setPaginationInfo: (metadata: Partial<SettablePaginationInfo>) => void
}
export interface SortingParams {
  sortingInfo: SortingDto;
  setSortingInfo: (metadata: Partial<SettableSortingInfo>) => void
}
export interface FilteringParams {
  filteringInfo: FilteringDto;
  setFilteringInfo: (metadata: Partial<SettableFilteringInfo>) => void
}
export interface ICommonParams
  extends PaginationParams,
    SortingParams,
    FilteringParams {
  setMessage?: (message: string) => void
}

export const CommonParam = createParamDecorator(
  async (data: string, ctx: ExecutionContext) => {
    const handler = ctx.getHandler()
    Reflect.defineMetadata(STANDARD_RESPONSE_MESSAGE_KEY, undefined, handler)

    const pagination = await getPagination(ctx)
    const sorting = await getSorting(ctx)
    const filtering = await getFiltering(ctx)
    const params: ICommonParams = {
      ...pagination,
      ...sorting,
      ...filtering,
      setMessage: (message) => {
        Reflect.defineMetadata(STANDARD_RESPONSE_MESSAGE_KEY, message, handler)
      },
    }
    return params
  },
)