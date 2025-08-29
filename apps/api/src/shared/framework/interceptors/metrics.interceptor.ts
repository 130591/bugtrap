import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { trace, metrics, SpanStatusCode } from '@opentelemetry/api'

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly tracer = trace.getTracer('bugtrap-api')
  private readonly meter = metrics.getMeter('bugtrap-api')
  
  private readonly requestDuration = this.meter.createHistogram('http_request_duration_ms', {
    description: 'Duration of HTTP requests in milliseconds',
  })
  
  private readonly requestCounter = this.meter.createCounter('http_requests_total', {
    description: 'Total number of HTTP requests',
  })
  
  private readonly errorCounter = this.meter.createCounter('http_request_errors_total', {
    description: 'Total number of HTTP request errors',
  })

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const className = context.getClass().name
    const methodName = context.getHandler().name
    const startTime = Date.now()
    
    const request = context.switchToHttp().getRequest()
    const { method, url, route } = request
    
    const spanName = `${className}.${methodName}`
    const span = this.tracer.startSpan(spanName, {
      attributes: {
        'http.method': method,
        'http.url': url,
        'http.route': route?.path || url,
        'service.class': className,
        'service.method': methodName,
      }
    })

    const labels = {
      method,
      route: route?.path || url,
      class: className,
      handler: methodName,
    }

    this.requestCounter.add(1, labels)

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime
        
        span.setAttributes({
          'http.status_code': context.switchToHttp().getResponse().statusCode,
          'http.response_size': JSON.stringify(response).length,
        })
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        
        this.requestDuration.record(duration, {
          ...labels,
          status: 'success',
        })
      }),
      catchError((error) => {
        const duration = Date.now() - startTime
        
        span.recordException(error)
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        })
        span.setAttributes({
          'error.name': error.constructor.name,
          'error.message': error.message,
        })
        span.end()
        
        this.requestDuration.record(duration, {
          ...labels,
          status: 'error',
        })
        
        this.errorCounter.add(1, {
          ...labels,
          error_type: error.constructor.name,
        })
        
        throw error
      })
    )
  }
}