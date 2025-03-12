import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Optional,
  Type,
  BadGatewayException,
  Logger,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ConfigService } from '@src/shared/config/service/config.service'
import { Observable } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { PaginationDto } from './dto/pagination.dto'
import { SortingDto } from './dto/sorting.dto'
import { FilteringDto } from './dto/filtering.dto'
import { StandardResponseDto } from './dto/response.dto'
import { RESPONSE_FILTERING_INFO_KEY, RESPONSE_PAGINATION_INFO_KEY, RESPONSE_SORTING_INFO_KEY, STANDARD_RESPONSE_MESSAGE_KEY } from './response.constants'


export interface ResponseModuleOptions {
  interceptAll?: boolean
  validateResponse?: (data) => boolean
  validationErrorMessage?: string
}

export const DEFAULT_VALIDATION_ERROR_MESSAGE =
  'Validation failed for your return value. Did you accidentally return a document directly from your ORM instead of building a DTO or similar class? This can lead to potential data leaks.';

const defaultOptions: ResponseModuleOptions = {
  interceptAll: true,
  validationErrorMessage: DEFAULT_VALIDATION_ERROR_MESSAGE,
}

export enum RESPONSE_TYPE {
  STANDARD = 'standard',
  RAW = 'raw',
}


export const STANDARD_RESPONSE_TYPE_KEY = 'standard_response_type'
export const STANDARD_RESPONSE_FEATURES_KEY = 'standard_response_features'
export enum RESPONSE_FEATURES {
  PAGINATION = 'pagination',
  SORTING = 'sorting',
  FILTERING = 'filtering',
}

@Injectable()
export class CommonResponseInterceptor<T> implements NestInterceptor<T> {
  private readonly logger = new Logger(CommonResponseInterceptor.name)
  private routeController: Type<any>
  private routeHandler: Function
  private responseFeatures: RESPONSE_FEATURES[]
  private responseType: RESPONSE_TYPE
  
  constructor(
    private readonly configService: ConfigService,
    private reflector: Reflector,
    @Optional()
    protected readonly options: ResponseModuleOptions = {},
  ) {
    this.options = { ...defaultOptions, ...options }
  }

  isValidResponse(data) {
    if (typeof data === 'undefined') return false
    if (typeof this.options.validateResponse === 'undefined') return true
    if (typeof this.options.validateResponse !== 'function') return false

    const isArray = Array.isArray(data)
    if (isArray) {
      if (data.some((value) => !this.options.validateResponse(value))) {
        this.logger.error(this.options.validationErrorMessage)
        return false
      }
    }
    
    if (!isArray && !this.options.validateResponse(data)) {
      this.logger.error(this.options.validationErrorMessage)
      return false
    }
    return true
  }

  transformResponse(data) {
    let transformFunction
    if (this.responseType === RESPONSE_TYPE.RAW) {
      transformFunction = (data) => data
      return transformFunction(data)
    }
    const responseFields: Partial<StandardResponseDto<typeof data>> = {}

    responseFields.message = this.reflector.get<string>(
      STANDARD_RESPONSE_MESSAGE_KEY,
      this.routeHandler,
    )

    if (this.responseFeatures.includes(RESPONSE_FEATURES.PAGINATION)) {
      const paginationInfo = this.reflector.get<PaginationDto>(
        RESPONSE_PAGINATION_INFO_KEY,
        this.routeHandler,
      )
      responseFields.pagination = paginationInfo
    }

    if (this.responseFeatures.includes(RESPONSE_FEATURES.SORTING)) {
      const sortingInfo = this.reflector.get<SortingDto>(
        RESPONSE_SORTING_INFO_KEY,
        this.routeHandler,
      )
      responseFields.sorting = sortingInfo
    }

    if (this.responseFeatures.includes(RESPONSE_FEATURES.FILTERING)) {
      const filteringInfo = this.reflector.get<FilteringDto>(
        RESPONSE_FILTERING_INFO_KEY,
        this.routeHandler,
      )
      responseFields.filtering = filteringInfo
    }

    transformFunction = (data) =>
      new StandardResponseDto({ ...responseFields, data })

    return transformFunction(data)
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    this.routeController = context.getClass()
    this.routeHandler = context.getHandler()

    this.responseType = this.reflector.getAllAndOverride(
      STANDARD_RESPONSE_TYPE_KEY,
      [this.routeHandler, this.routeController],
    )

    if (!this.responseType && !this.options.interceptAll) {
      return next.handle()
    }

    this.responseFeatures =
      this.reflector.getAllAndMerge(STANDARD_RESPONSE_FEATURES_KEY, [
        this.routeHandler,
        this.routeController,
      ]) ?? []

    return next.handle().pipe(
      map((data) => {
        if (data instanceof HttpException) {
          return data;
        }
        if (!this.isValidResponse(data)) {
          return new BadGatewayException()
        }
        return this.transformResponse(data)
      }),
      catchError((error) => {
        if (error instanceof HttpException) {
          const status = error.getStatus()
          const responseBody = error.getResponse()
          const message =
            typeof responseBody === 'string' ? responseBody : responseBody['message'];
          const errors =
            typeof responseBody === 'object' && responseBody['errors']
              ? responseBody['errors']
              : [];

          throw new HttpException(
            {
              status: 'error',
              error: {
                code: error.getResponse(),
                message: message || 'Internal server error',
                details: errors,
              }
            },
            status,
          );
        }

        throw new HttpException(
          {
            status: 'error',
            error: {
              code: 'dd',
              message: 'An unexpected error occurred',
              details: [error.message || 'Unknown error'],
            }
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
    )
  }
}
