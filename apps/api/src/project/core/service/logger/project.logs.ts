import { LoggerService } from '@nestjs/common'
import { CreateProjectRequestDto } from '../../../http/rest/dto/request/project.dto'

export namespace ProjectLogs {
  export function projectCreated(
    logger: LoggerService,
    userId: string,
    projectId: string,
    organizationId: string,
  ): void {
    logger.log('Project created successfully', {
      who: userId,
      where: 'CreateProjectService.execute',
      what: 'project_created',
      why: 'user_initiated_project_creation',
      projectId: projectId,
      organizationId: organizationId,
      context: 'project_management'
    })
  }

  export function projectCreationFailed(
    logger: LoggerService,
    userId: string,
    error: Error,
    command: CreateProjectRequestDto,
  ): void {
    logger.error('Project creation failed', {
      who: userId,
      where: 'CreateProjectService.execute',
      what: 'project_creation_failed',
      why: error.message,
      errorType: error.constructor.name,
      organizationId: command.organizationId,
      context: 'project_management'
    })
  }

  export function memberAdded(
    logger: LoggerService,
    userId: string,
    projectId: string,
    memberId: string,
  ): void {
    logger.log('Member added to project', {
      who: userId,
      where: 'AddMemberService.execute',
      what: 'member_added',
      why: 'user_initiated_member_addition',
      projectId: projectId,
      memberId: memberId,
      context: 'project_management'
    })
  }

  export function memberAdditionFailed(
    logger: LoggerService,
    userId: string,
    error: Error,
    projectId: string,
    memberId: string,
  ): void {
    logger.error('Member addition failed', {
      who: userId,
      where: 'AddMemberService.execute',
      what: 'member_addition_failed',
      why: error.message,
      errorType: error.constructor.name,
      projectId: projectId,
      memberId: memberId,
      context: 'project_management'
    })
  }

  export function statusChanged(
    logger: LoggerService,
    userId: string,
    projectId: string,
    fromStatus: string,
    toStatus: string,
  ): void {
    logger.log('Project status changed', {
      who: userId,
      where: 'ChangeStatusService.execute',
      what: 'status_changed',
      why: 'user_initiated_status_change',
      projectId: projectId,
      fromStatus: fromStatus,
      toStatus: toStatus,
      context: 'project_management'
    })
  }

  export function statusChangeFailed(
    logger: LoggerService,
    userId: string,
    error: Error,
    projectId: string,
    attemptedStatus: string,
  ): void {
    logger.error('Project status change failed', {
      who: userId,
      where: 'ChangeStatusService.execute',
      what: 'status_change_failed',
      why: error.message,
      errorType: error.constructor.name,
      projectId: projectId,
      attemptedStatus: attemptedStatus,
      context: 'project_management'
    })
  }

  export function projectSearched(
    logger: LoggerService,
    userId: string,
    searchTerm: string,
    resultCount: number,
  ): void {
    logger.log('Project search performed', {
      who: userId,
      where: 'SearchProjectService.execute',
      what: 'project_searched',
      why: 'user_initiated_search',
      searchTerm: searchTerm,
      resultCount: resultCount,
      context: 'project_management'
    })
  }

  export function invitationSent(
    logger: LoggerService,
    userId: string,
    projectId: string,
    inviteeEmail: string,
  ): void {
    logger.log('Project invitation sent', {
      who: userId,
      where: 'InviteMemberService.execute',
      what: 'invitation_sent',
      why: 'user_initiated_member_invitation',
      projectId: projectId,
      inviteeEmail: inviteeEmail,
      context: 'project_management'
    })
  }

  export function invitationConfirmed(
    logger: LoggerService,
    userId: string,
    projectId: string,
    invitationId: string,
  ): void {
    logger.log('Project invitation confirmed', {
      who: userId,
      where: 'ConfirmInviteService.execute',
      what: 'invitation_confirmed',
      why: 'user_confirmed_invitation',
      projectId: projectId,
      invitationId: invitationId,
      context: 'project_management'
    })
  }

  export function favoriteAdded(
    logger: LoggerService,
    userId: string,
    projectId: string,
  ): void {
    logger.log('Project added to favorites', {
      who: userId,
      where: 'AddFavoriteService.execute',
      what: 'favorite_added',
      why: 'user_added_project_to_favorites',
      projectId: projectId,
      context: 'project_management'
    })
  }

  export function favoriteRemoved(
    logger: LoggerService,
    userId: string,
    projectId: string,
  ): void {
    logger.log('Project removed from favorites', {
      who: userId,
      where: 'RemoveFavoriteService.execute',
      what: 'favorite_removed',
      why: 'user_removed_project_from_favorites',
      projectId: projectId,
      context: 'project_management'
    })
  }
}
