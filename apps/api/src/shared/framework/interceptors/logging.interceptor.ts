import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
	NotFoundException,
	ConflictException,
	ForbiddenException,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { Request } from 'express'
import { LoggerService } from '@src/shared/lib/logger'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const className = context.getClass().name
    const methodName = context.getHandler().name
    const request = context.switchToHttp().getRequest<Request>()

    const requestingUserId = request?.user || request?.headers?.['x-user-id'] || 'system_process'
    const correlationId = request?.headers?.['x-correlation-id'] || 'no_correlation_id'

    const start = Date.now()

    // Log de INÍCIO da execução do método (opcional, pode ser verborrágico)
    // Com OpenTelemetry, este tipo de log pode ser coberto pelo span de "método X iniciado".
    /*
    this.logger.debug(
      `Starting ${className}.${methodName}`,
      {
        who: requestingUserId,
        where: `${className}.${methodName}`,
        what: 'method_execution_start',
        correlationId: correlationId,
        params: context.getArgs()[0], // Passa os parâmetros da requisição/comando
      }
    )
    */

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - start
        this.logger.log(
          `Finished ${className}.${methodName} successfully`,
          {
            who: requestingUserId,
            where: `${className}.${methodName}`,
            what: 'method_execution_success',
            why: 'operation_completed',
            correlationId: correlationId,
            responseTimeMs: responseTime,
          }
        )
      }),
      catchError(error => {
        const responseTime = Date.now() - start
        let what = 'method_execution_failed'
        let why = error.message

        if (error instanceof HttpException) {
          what = 'business_logic_failure'
          if (error instanceof NotFoundException) {
            why = `resource_not_found: ${error.message}`
          } else if (error instanceof ConflictException) {
            what = 'business_rule_violation'
            why = `conflict_detected: ${error.message}`
          } else if (error instanceof ForbiddenException) {
            what = 'unauthorized_access_attempt'
            why = `access_forbidden: ${error.message}`
          }
          
          this.logger.warn(
            `Failed ${className}.${methodName} with business error`,
            {
              who: requestingUserId,
              where: `${className}.${methodName}`,
              what: what,
              why: why,
              correlationId: correlationId,
              responseTimeMs: responseTime,
              errorDetails: error.getResponse(),
            }
          )
        } else {
          this.logger.error(
            `Failed ${className}.${methodName} with unexpected error`,
            {
              who: requestingUserId,
              where: `${className}.${methodName}`,
              what: 'system_error',
              why: `unexpected_error: ${error.message}`,
              correlationId: correlationId,
              responseTimeMs: responseTime,
              stack: error.stack,
            }
          )
        }
        return throwError(() => error)
      })
    )
  }
}