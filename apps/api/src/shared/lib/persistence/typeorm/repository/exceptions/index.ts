import { ConflictException } from '@nestjs/common'

export class ConcurrencyException extends ConflictException {
  constructor() {
    super('The entity was updated by another transaction. Please retry your operation.')
  }
}