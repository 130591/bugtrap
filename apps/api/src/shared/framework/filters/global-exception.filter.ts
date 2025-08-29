import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException,
  LoggerService
} from '@nestjs/common'
import { Response, Request } from 'express'
import { randomUUID } from 'crypto'
import { DomainError } from '../errors/domain-error.base'
import { MetricsService } from '../metrics/metrics.service'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly metricsService: MetricsService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const correlationId = request.headers['x-correlation-id'] as string || randomUUID()
    
    if (exception instanceof DomainError) {
      return this.handleDomainError(exception, response, correlationId)
    }
    
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, response, correlationId)
    }

    return this.handleUnknownError(exception, response, request, correlationId)
  }

  private handleDomainError(error: DomainError, response: Response, correlationId: string) {
    // Log detalhado interno
    this.logger.error(error.getDetailedMessage(), {
      who: 'system_process',
      where: 'GlobalExceptionFilter.handleDomainError',
      what: 'domain_error_occurred',
      why: error.message,
      errorCode: error.code,
      errorCategory: error.category,
      correlationId,
      stack: error.stack
    })

    this.metricsService.incrementCounter('domain_errors_total', error.getMetricsTags())

    return response.status(error.statusCode).json({
      status: 'error',
      error: {
        code: error.code,
        message: error.getPublicMessage(),
        correlationId,
        retryable: error.isRetryable
      }
    })
  }

  private handleHttpException(exception: HttpException, response: Response, correlationId: string) {
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    this.logger.warn('HTTP exception occurred', {
      who: 'system_process',
      where: 'GlobalExceptionFilter.handleHttpException',
      what: 'http_exception_occurred',
      why: exception.message,
      statusCode: status,
      correlationId
    })

    return response.status(status).json({
      status: 'error',
      error: {
        code: 'HTTP_EXCEPTION',
        message: typeof exceptionResponse === 'string' ? exceptionResponse : exception.message,
        correlationId,
        retryable: false
      }
    })
  }

  private handleUnknownError(
    error: unknown, 
    response: Response, 
    request: Request, 
    correlationId: string
  ) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    this.logger.error('Unhandled error occurred', {
      who: (request.user?.sub || 'anonymous') as string,
      where: `${request.method} ${request.url}`,
      what: 'unhandled_error',
      why: errorMessage,
      correlationId,
      stack: errorStack,
      requestBody: this.sanitizeRequestBody(request.body),
      userAgent: request.headers['user-agent']
    })

    this.metricsService.incrementCounter('unhandled_errors_total', {
      method: request.method,
      path: request.route?.path || request.url
    })

    return response.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        correlationId
      }
    })
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') return body

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization']
    const sanitized = { ...body }

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    }

    return sanitized
  }
}