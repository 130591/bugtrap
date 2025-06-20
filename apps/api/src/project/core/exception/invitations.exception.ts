import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common'

export class InvitationNotFoundException extends NotFoundException {
  constructor() {
    super('Invitation not found')
  }
}

export class InvitationAlreadyUsedException extends ConflictException {
  constructor() {
    super('Invitation has already been used or is invalid')
  }
}

export class InviteLimitExceededException extends ForbiddenException {
  constructor(message?: string) {
    super(message ?? 'Invite limit exceeded')
  }
}
