import { ConflictException, BadRequestException } from '@nestjs/common'
import { DomainError, ErrorCategory } from '@src/shared/framework'

export class ProjectNotFoundException extends DomainError {
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

export class OwnershipChangeNotAllowedException extends ConflictException {
  constructor(status: string) {
    super(`Unable to change the owner of a project with status '${status}'`)
  }
}

export class InvalidStatusTransitionException extends ConflictException {
  constructor(current: string, next: string) {
    super(`Cannot change status from '${current}' to '${next}'`)
  }
}

export class FailedToAddMembersException extends ConflictException {
  constructor() {
    super('Failed to add any members to the project.')
  }
}

export class OwnerProjectLimitExceededException extends BadRequestException {
  constructor() {
    super('Owner cannot have more than 100 active projects')
  }
}

export class UserAlreadyMemberException extends ConflictException {
  constructor() {
    super('User is already a member of the project')
  }
}
