import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'

export class ProjectNotFoundException extends NotFoundException {
  constructor(projectId: string) {
    super(`Project with ID '${projectId}' not found`)
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
