import { ForbiddenException, ConflictException } from '@nestjs/common'

export class FavoriteNotAllowedException extends ForbiddenException {
  constructor() {
    super('Cannot favorite a finalized project')
  }
}

export class OnlyMembersOrOwnerCanFavoriteException extends ForbiddenException {
  constructor() {
    super('Only members or the owner can favorite a project')
  }
}

export class MaxFavoritesReachedException extends ForbiddenException {
  constructor(maxFavorites: number) {
    super(`You have reached the maximum of ${maxFavorites} favorites`)
  }
}

export class ProjectAlreadyFavoritedException extends ConflictException {
  constructor() {
    super('Project already favorited by this user')
  }
}
