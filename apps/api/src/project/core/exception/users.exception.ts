import { NotFoundException } from '@nestjs/common'

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super('User does not exist')
  }
}

export class GuestUserNotFoundException extends NotFoundException {
  constructor(email: string) {
    super(`Guest user with email ${email} not found`)
  }
}

export class UsersNotFoundException extends NotFoundException {
  constructor() {
    super('One or more users not found')
  }
}

export class OwnerNotFoundException extends NotFoundException {
  constructor() {
    super('Owner not found')
  }
}
