import { LoggerService } from '@src/shared/lib/logger'


/**
 * Funções utilitárias para logs específicos do AddFavoriteService.
 */
export namespace AddFavoriteLogs {

  export function projectNotFound(
    logger: LoggerService,
    requestingUserId: string,
    projectId: string,
  ): void {
    logger.error(
      'Project not found for favorite addition',
      {
        who: requestingUserId,
        where: 'AddFavoriteService.execute',
        why: 'project_not_found_for_favoriting',
        projectId: projectId,
      }
    )
  }

  export function forbiddenStatusFavorite(
    logger: LoggerService,
    userId: string,
    projectId: string,
    projectStatus: string,
  ): void {
    logger.warn(
      'Attempt to favorite a finalized project',
      {
        who: userId,
        where: 'AddFavoriteService.validateFavoriteEligibility',
        why: 'project_finalized_status',
        projectId: projectId,
        projectStatus: projectStatus
      }
    )
  }

  export function unauthorizedUserFavoriteAttempt(
    logger: LoggerService,
    userId: string,
    projectId: string,
  ): void {
    logger.warn(
      'Unauthorized user attempted to favorite project',
      {
        who: userId,
        where: 'AddFavoriteService.validateFavoriteEligibility',
        why: 'user_not_member_or_owner',
        projectId: projectId
      }
    )
  }

  export function favoriteLimitExceeded(
    logger: LoggerService,
    userId: string,
    projectId: string,
    currentFavorites: number,
    maxFavorites: number,
  ): void {
    logger.warn(
      'User attempted to favorite a project, but exceeded maximum favorites limit',
      {
        who: userId,
        where: 'AddFavoriteService.validateFavoriteEligibility',
        why: 'favorite_limit_exceeded',
        projectId: projectId,
        currentFavorites: currentFavorites,
        maxFavorites: maxFavorites
      }
    )
  }

  export function alreadyFavoritedByUser(
    logger: LoggerService,
    userId: string,
    projectId: string,
  ): void {
    logger.warn(
      'User attempted to favorite an already favorited project',
      {
        who: userId,
        where: 'AddFavoriteService.execute',
        why: 'already_favorited_by_user',
        projectId: projectId
      }
    )
  }

  export function favoriteSuccessfullyAdded(
    logger: LoggerService,
    userId: string,
    projectId: string,
    note?: string,
    context?: string,
  ): void {
    logger.log(
      'Project successfully favorited',
      {
        who: userId,
        where: 'AddFavoriteService.execute',
        what: 'favorite_added_to_project',
        projectId: projectId,
        note: note,
        context: context
      }
    )
  }

  export function favoriteEventDispatched(
    logger: LoggerService,
    projectId: string,
    userId: string,
  ): void {
    logger.log(
      'Project favorite event dispatched to broker',
      {
        who: 'system_process',
        where: 'AddFavoriteService.execute',
        what: 'event_dispatch_success',
        why: 'favorite_addition_notification_sent',
        externalSystem: 'message_broker',
        projectId: projectId,
        userId: userId
      }
    )
  }
}