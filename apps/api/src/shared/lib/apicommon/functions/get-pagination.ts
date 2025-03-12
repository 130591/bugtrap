import { BadRequestException, ExecutionContext } from "@nestjs/common"
import { PaginatedResponseOptions, PaginationDto } from "../dto/pagination.dto"
import { plainToInstance } from "class-transformer"
import { RESPONSE_PAGINATION_INFO_KEY } from "../response.constants"
import { PaginationParams } from "../decorator/param.decorator"
import { validate } from "class-validator"
import { PaginationQueryDto } from "../dto/pagination-query"


export async function getPagination(
  ctx: ExecutionContext,
): Promise<PaginationParams> {
  const handler = ctx.getHandler()

  const paginationInfo = await validatePaginationQuery(ctx)

  paginationInfo.count = undefined

  Reflect.defineMetadata(RESPONSE_PAGINATION_INFO_KEY, paginationInfo, handler)

  const pagination: PaginationParams = {
    paginationInfo: paginationInfo,
    setPaginationInfo: function (metadata) {
      const currentMetadata = Reflect.getMetadata(
        RESPONSE_PAGINATION_INFO_KEY,
        handler,
      );
      const newMetadata = {
        ...currentMetadata,
        ...metadata,
      }
      Reflect.defineMetadata(
        RESPONSE_PAGINATION_INFO_KEY,
        newMetadata,
        handler,
      );
    },
  }
  return pagination
}

export async function validatePaginationQuery(
  ctx: ExecutionContext,
): Promise<PaginationDto> {
  const request = ctx.switchToHttp().getRequest()

  const paginationOptions: PaginatedResponseOptions = Reflect.getMetadata(
    RESPONSE_PAGINATION_INFO_KEY,
    ctx.getHandler(),
  )

  const queryData = {
    limit: parseInt(request.query.limit),
    offset: parseInt(request.query.offset),
  }

  if (isNaN(queryData.offset)) {
    queryData.offset = 0
  }

  if (isNaN(queryData.limit)) {
    queryData.limit = paginationOptions?.defaultLimit || 10
  }

  const paginationQuery = plainToInstance(PaginationQueryDto, queryData)
  const errors = await validate(paginationQuery);
  if (errors.length > 0) {
    throw new BadRequestException(
      errors.map((error) => {
        return {
          field: error.property,
          error: Object.values(error.constraints).join(', '),
        }
      }),
    )
  }

  const paginationInfo = new PaginationDto({
    ...paginationOptions,
    limit: paginationQuery.limit,
    offset: paginationQuery.offset,
  });
  const limitQueryExists = typeof request.query.limit !== 'undefined';
  const offsetQueryExists = typeof request.query.offset !== 'undefined';

  if (!limitQueryExists && !offsetQueryExists) {
    return paginationInfo
  }

  paginationInfo.query = ''
  if (limitQueryExists) {
    paginationInfo.query += `limit=${request.query.limit}`
  }
  if (offsetQueryExists) {
    if (limitQueryExists) paginationInfo.query += '&'
    paginationInfo.query += `offset=${request.query.offset}`
  }

  if (
    paginationOptions?.minLimit &&
    paginationQuery.limit < paginationOptions.minLimit
  ) {
    throw new BadRequestException({
      field: 'limit',
      error: `limit can't be smaller than ${paginationOptions.minLimit}`,
    });
  }

  if (
    paginationOptions?.maxLimit &&
    paginationQuery.limit > paginationOptions.maxLimit
  ) {
    throw new BadRequestException({
      field: 'limit',
      error: `limit can't be larger than ${paginationOptions.maxLimit}`,
    });
  }

  return paginationInfo
}