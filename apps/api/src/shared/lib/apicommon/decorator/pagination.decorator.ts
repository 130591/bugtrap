import { SetMetadata } from '@nestjs/common'
import { RESPONSE_PAGINATION_INFO_KEY } from '../response.constants'
import { PaginationDto } from '../dto/pagination.dto'

export const SetResponsePaginationInfo = (
  obj: Partial<PaginationDto>,
) => SetMetadata(RESPONSE_PAGINATION_INFO_KEY, obj)