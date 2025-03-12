import { applyDecorators, Type } from "@nestjs/common"
import { SetMetadata } from '@nestjs/common'
import { RESPONSE_FEATURES, RESPONSE_TYPE, STANDARD_RESPONSE_FEATURES_KEY } from "../common-response.interceptor"
import { SortedResponseOptions } from "../dto/sorting.dto"
import { PaginatedResponseOptions } from "../dto/pagination.dto"
import { ApiExtraModels, ApiQuery, ApiResponse, getSchemaPath } from "@nestjs/swagger"
import { StandardResponseDto } from "../dto/response.dto"
import { SetResponsePaginationInfo } from "./pagination.decorator"
import { SetResponseSorting } from "./sorting.decorator"
import { SetResponseFiltering } from "./filtering.decorator"


export interface FilteredResponseOptions {
  filterableFields?: string[];
}

export interface ResponseOptions<TModel = ResponseModelType>
  extends PaginatedResponseOptions,
    SortedResponseOptions,
    FilteredResponseOptions {
  type?: TModel;
  status?: number | "default" | "1XX" | "2XX" | "3XX" | "4XX" | "5XX";
  description?: string;
  isPaginated?: boolean;
  isSorted?: boolean;
  isFiltered?: boolean;
}
const responseFeatures = [];

export const STANDARD_RESPONSE_TYPE_KEY = 'response_type'
export type AnyClass = Type<unknown>
export type ClassOrClassArray = AnyClass | [className: AnyClass]
export type ResponseModelType = ClassOrClassArray | string | [string]

export const SetStandardResponseType = (type: RESPONSE_TYPE) =>
  SetMetadata(STANDARD_RESPONSE_TYPE_KEY, type)

export const SetStandardResponseFeatures = (features: RESPONSE_FEATURES[]) =>
  SetMetadata(STANDARD_RESPONSE_FEATURES_KEY, features);

export function CommonResponse<TModel extends ResponseModelType>({
  type,
  status = 200,
  description,
  isPaginated,
  isSorted,
  isFiltered,
  maxLimit,
  minLimit = 1,
  defaultLimit = 10,
  sortableFields,
  filterableFields,
}: ResponseOptions<TModel> = {}) {
  let isArray = false;
  let returnType: AnyClass | string
  if (Array.isArray(type)) {
    isArray = true
    returnType = type[0]
  } else {
    returnType = type
  }

  if (isPaginated) {
    isArray = true
  }

  const helpText = [];
  if (typeof minLimit !== "undefined") helpText.push(`min: ${minLimit}`);
  if (typeof maxLimit !== "undefined") helpText.push(`max: ${maxLimit}`);
  if (typeof defaultLimit !== "undefined")
    helpText.push(`default: ${defaultLimit}`)

  const limitHelpText = helpText.length > 0 ? ` (${helpText.join(", ")})` : ""
  const responseFeatures = []
  if (isPaginated) responseFeatures.push(RESPONSE_FEATURES.PAGINATION)
  if (isSorted) responseFeatures.push(RESPONSE_FEATURES.SORTING)
  if (isFiltered) responseFeatures.push(RESPONSE_FEATURES.FILTERING)

  const decoratorsToApply: (
    | MethodDecorator
    | ClassDecorator
    | PropertyDecorator
  )[] = [
    SetStandardResponseType(RESPONSE_TYPE.STANDARD),
    SetStandardResponseFeatures(responseFeatures),
    ApiExtraModels(StandardResponseDto),
  ]

  if (typeof returnType === "function") {
    decoratorsToApply.push(ApiExtraModels(returnType))
  }

  if (isPaginated) {
    decoratorsToApply.push(
      SetResponsePaginationInfo({
        minLimit: minLimit,
        maxLimit: maxLimit,
        defaultLimit: defaultLimit,
      }),
      ApiQuery({
        name: "limit",
        required: false,
        description: `How many items to retrieve${limitHelpText}:`,
      }),
      ApiQuery({
        name: "offset",
        required: false,
        description: "How many items to skip from beggining of list:",
      })
    )
  }

  if (isSorted) {
    decoratorsToApply.push(
      SetResponseSorting({
        sortableFields: sortableFields,
      }),
      ApiQuery({
        name: "sort",
        required: false,
        description: `A list of properties used to sort the results. Properties must be separated by comma, and optionally preceded by a minus sign. (Ex: '-popularity,title' )`,
      })
    )
  }

  if (isFiltered) {
    decoratorsToApply.push(
      SetResponseFiltering({
        filterableFields: filterableFields,
      }),
      ApiQuery({
        name: "filter",
        required: false,
        description: `Restricts results based on filters. A filter is composed of a property name, followed by an operator and a value. (Ex: 'country==Italy'). Filters can be combined using a comma (,) for the OR operation, or a semi-colon (;) for the AND operation. (Ex: to filter by country being equal to Italy or Germany, and year 2010 and later: 'country==Italy,country==Germany;year>=2010')
        Possible operators are:
        ==	Equals
        !=	Not equals
        <=	Less than or equal
        <	Less than
        =@	Contains
        !@	Does not contain
        =^	Starts with
        =$	Ends with.
        These rules are similar to APIs like Google Analytics or Matomo Analytics. For more info, see: https://developers.google.com/analytics/devguides/reporting/core/v3/reference#filters and https://developer.matomo.org/api-reference/reporting-api-segmentation`,
        // example: 'country==Italy,country==Germany;year>=2010',
        // schema: { type: 'string' },
      })
    )
  }

  const dataArraySchema = {
    type: "array",
    items: {
      ...(typeof returnType === "string"
        ? { type: "string" }
        : { $ref: getSchemaPath(returnType) }),
      // $ref: getSchemaPath(returnType),
    },
  }
  const dataObjSchema =
    typeof returnType === "undefined"
      ? {}
      : {
          ...(typeof returnType === "string"
            ? { type: "string" }
            : { $ref: getSchemaPath(returnType) }),
        }

        decoratorsToApply.push(
          ApiResponse({
            status: status,
            description: description,
            content: {
              "application/json": {
                schema: {
                  title: returnType
                    ? `StandardResponseOf${
                        typeof returnType === "string"
                          ? returnType[0].toUpperCase() + returnType.slice(1)
                          : returnType.name
                      }`
                    : "StandardResponse",
                  allOf: [
                    { $ref: getSchemaPath(StandardResponseDto) },
                    {
                      properties: { data: isArray ? dataArraySchema : dataObjSchema },
                    },
                  ],
                },
              },
            },
          })
        )

	return applyDecorators(...decoratorsToApply)
}