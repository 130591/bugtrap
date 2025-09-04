import { DomainError, ErrorCategory } from '../../../shared/framework/errors/domain-error.base'

export class ProjectNotFoundError extends DomainError {
  readonly code = 'PROJECT_NOT_FOUND'
  readonly statusCode = 404
  readonly isRetryable = false
  readonly category = ErrorCategory.VALIDATION

  constructor(projectId: string) {
    super('Project not found', { projectId })
  }

  getPublicMessage(): string {
    return 'Project not found'
  }
}

export class OwnerProjectLimitExceededException extends DomainError {
  readonly code = 'OWNER_PROJECT_LIMIT_EXCEEDED'
  readonly statusCode = 409
  readonly isRetryable = false
  readonly category = ErrorCategory.BUSINESS_RULE

  constructor(ownerId: string, currentCount: number, maxAllowed: number) {
    super('Owner has reached the maximum number of projects allowed', {
      ownerId,
      currentCount,
      maxAllowed
    })
  }

  getPublicMessage(): string {
    return 'You have reached the maximum number of projects allowed'
  }
}

export class InvalidStatusTransitionException extends DomainError {
  readonly code = 'INVALID_STATUS_TRANSITION'
  readonly statusCode = 400
  readonly isRetryable = false
  readonly category = ErrorCategory.BUSINESS_RULE

  constructor(fromStatus: string, toStatus: string) {
    super(`Invalid status transition from ${fromStatus} to ${toStatus}`, {
      fromStatus,
      toStatus
    })
  }

  getPublicMessage(): string {
    return 'Invalid status transition'
  }
}

export class MaxMembersExceededException extends DomainError {
  readonly code = 'MAX_MEMBERS_EXCEEDED'
  readonly statusCode = 409
  readonly isRetryable = false
  readonly category = ErrorCategory.BUSINESS_RULE

  constructor(projectId: string, currentCount: number, maxAllowed: number) {
    super('Project has reached the maximum number of members allowed', {
      projectId,
      currentCount,
      maxAllowed
    })
  }

  getPublicMessage(): string {
    return 'Project has reached the maximum number of members allowed'
  }
}

export class UserAlreadyMemberException extends DomainError {
  readonly code = 'USER_ALREADY_MEMBER'
  readonly statusCode = 409
  readonly isRetryable = false
  readonly category = ErrorCategory.BUSINESS_RULE

  constructor(userId: string, projectId: string) {
    super('User is already a member of this project', {
      userId,
      projectId
    })
  }

  getPublicMessage(): string {
    return 'User is already a member of this project'
  }
}

export class ProjectAccessDeniedException extends DomainError {
  readonly code = 'PROJECT_ACCESS_DENIED'
  readonly statusCode = 403
  readonly isRetryable = false
  readonly category = ErrorCategory.SECURITY

  constructor(userId: string, projectId: string) {
    super('User does not have access to this project', {
      userId,
      projectId
    })
  }

  getPublicMessage(): string {
    return 'Access denied to this project'
  }
}

export class ExternalServiceError extends DomainError {
  readonly code = 'EXTERNAL_SERVICE_ERROR'
  readonly statusCode = 503
  readonly isRetryable = true
  readonly category = ErrorCategory.EXTERNAL_SERVICE

  constructor(serviceName: string, originalError: Error) {
    super(`External service ${serviceName} is unavailable`, 
          { serviceName }, 
          originalError)
  }

  getPublicMessage(): string {
    return 'External service temporarily unavailable'
  }
}

export class InvalidProjectStatusException extends DomainError {
  readonly code = 'INVALID_PROJECT_STATUS'
  readonly statusCode = 400
  readonly isRetryable = false
  readonly category = ErrorCategory.VALIDATION

  constructor(status: string) {
    super(`Invalid project status: ${status}`, { status })
  }

  getPublicMessage(): string {
    return 'Invalid project status'
  }
}
