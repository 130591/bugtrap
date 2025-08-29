export enum ErrorCategory {
  VALIDATION = 'validation',
  BUSINESS_RULE = 'business_rule', 
  EXTERNAL_SERVICE = 'external_service',
  INFRASTRUCTURE = 'infrastructure',
  SECURITY = 'security'
}

export abstract class DomainError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
  abstract readonly isRetryable: boolean
  abstract readonly category: ErrorCategory

  constructor(
    message: string,
    public readonly context?: Record<string, any>,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = this.constructor.name
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  getDetailedMessage(): string {
    const contextStr = this.context 
      ? ` Context: ${JSON.stringify(this.context)}`
      : ''
    return `${this.message}${contextStr}`
  }

  getPublicMessage(): string {
    return this.message
  }
  
  getMetricsTags(): Record<string, string> {
    return {
      error_code: this.code,
      error_category: this.category,
      is_retryable: this.isRetryable.toString()
    }
  }
}
