import { ExecutionContext, BadRequestException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { SortingParams } from '../decorator/param.decorator'
import { RESPONSE_SORTING_INFO_KEY } from '../response.constants'
import { SortedResponseOptions, SortingDto, SortingOperation, SortingOrder, SortingQueryDto } from '../dto/sorting.dto'

export async function getSorting(
  ctx: ExecutionContext,
): Promise<SortingParams> {
  const handler = ctx.getHandler()

  const sortingInfo = await validateSortingQuery(ctx)

  Reflect.defineMetadata(RESPONSE_SORTING_INFO_KEY, sortingInfo, handler)

  const sorting: SortingParams = {
    sortingInfo: sortingInfo,
    setSortingInfo: function (metadata) {
      const currentMetadata = Reflect.getMetadata(
        RESPONSE_SORTING_INFO_KEY,
        handler,
      );
      const newMetadata = {
        ...currentMetadata,
        ...metadata,
      }
      Reflect.defineMetadata(RESPONSE_SORTING_INFO_KEY, newMetadata, handler)
    },
  };
  return sorting;
}

export async function validateSortingQuery(
  ctx: ExecutionContext,
): Promise<SortingDto> {
  const request = ctx.switchToHttp().getRequest();

  const sortingOptions: SortedResponseOptions = Reflect.getMetadata(
    RESPONSE_SORTING_INFO_KEY,
    ctx.getHandler(),
  )

  const sortingQuery = plainToInstance(SortingQueryDto, {
    sort: request.query.sort,
  })
	
  const errors = await validate(sortingQuery)
  if (errors.length > 0) {
    throw new BadRequestException(
      errors.map((error) => {
        return {
          field: error.property,
          error: Object.values(error.constraints).join(', '),
        };
      }),
    );
  }

  const sortingInfo = new SortingDto(sortingOptions)
  if (!sortingQuery.sort) {
    return sortingInfo;
  }

  sortingInfo.query = sortingQuery.sort
  sortingInfo.sort = sortingQuery.sort
    .split(',')
    .map((field): SortingOperation => {
      if (field.charAt(0) === '-') {
        return {
          field: field.substring(1),
          order: SortingOrder.DES,
        };
      }
      if (field.charAt(0) === '+') {
        return {
          field: field.substring(1),
          order: SortingOrder.ASC,
        };
      }
      return {
        field: field,
        order: SortingOrder.ASC,
      }
    })

  const queryFields = sortingInfo.sort.map((op: SortingOperation) => op.field)

  if (sortingOptions?.sortableFields) {
    const invalidFields = queryFields.filter(
      (field) => !sortingOptions.sortableFields.includes(field),
    )
    if (invalidFields.length > 0) {
      throw new BadRequestException({
        field: 'sort',
        error: `invalid sorting field${
          invalidFields.length > 1 ? 's' : ''
        }: ${invalidFields.join(', ')}`,
      })
    }
  }

  return sortingInfo
}