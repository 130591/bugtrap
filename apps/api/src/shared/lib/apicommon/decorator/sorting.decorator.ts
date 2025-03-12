import { SetMetadata } from '@nestjs/common'
import { RESPONSE_SORTING_INFO_KEY } from '../response.constants'
import { SortingDto } from '../dto/sorting.dto'

export const SetResponseSorting = (obj: Partial<SortingDto>) =>
  SetMetadata(RESPONSE_SORTING_INFO_KEY, obj)