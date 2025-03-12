
import { SetMetadata } from '@nestjs/common'
import { RESPONSE_FILTERING_INFO_KEY } from '../response.constants'
import { FilteringDto } from '../dto/filtering.dto'

export const SetResponseFiltering = (
  obj: Partial<FilteringDto>,
) => SetMetadata(RESPONSE_FILTERING_INFO_KEY, obj)