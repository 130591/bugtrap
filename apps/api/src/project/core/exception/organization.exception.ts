import { NotFoundException, ForbiddenException } from '@nestjs/common'

export class AccountNotFoundException extends NotFoundException {
  constructor() {
    super('Account not found')
  }
}

export class UserDoesNotBelongToOrganizationException extends ForbiddenException {
  constructor(userEmail: string, organizationId: string) {
    super(`User ${userEmail} does not belong to organization ${organizationId}`)
  }
}
