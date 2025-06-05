import { LoggerService } from '@src/shared/lib/logger'

export namespace AddMemberLogs {

  export function projectNotFound(
    logger: LoggerService,
    requestingUserId: string,
    projectId: string,
    membersAttempted: string[],
  ): void {
    logger.error(
      'Project not found for member addition operation',
      {
        who: requestingUserId,
        where: 'AddMemberService.execute',
        why: 'project_id_not_found',
        projectId: projectId,
        membersAttempted: membersAttempted,
      }
    )
  }

  export function policyViolation(
    logger: LoggerService,
    requestingUserId: string,
    projectId: string,
    membersAttempted: string[],
    errorMessage: string,
  ): void {
    logger.warn(
      'Policy violation when adding members to project',
      {
        who: requestingUserId,
        where: 'AddMemberService.execute -> Membership.checkPolicies',
        what: 'policy_violation',
        why: errorMessage,
        projectId: projectId,
        membersToAdd: membersAttempted,
      }
    )
  }

  export function membersAddedSuccess(
    logger: LoggerService,
    requestingUserId: string,
    projectId: string,
    fulfilledCount: number,
    rejectedCount: number,
    membersAttempted: string[],
  ): void {
    const message = rejectedCount > 0
      ? `Partially added members to project (added: ${fulfilledCount}, failed: ${rejectedCount})`
      : `Successfully added all members to project`

    logger.log(
      message,
      {
        who: requestingUserId,
        where: 'AddMemberService.execute',
        what: 'members_addition_operation_completed',
        projectId: projectId,
        membersAddedCount: fulfilledCount,
        membersFailedCount: rejectedCount,
        membersAttempted: membersAttempted,
      }
    )
  }

  export function allMembersAdditionFailed(
    logger: LoggerService,
    requestingUserId: string,
    projectId: string,
    membersAttempted: string[],
    failureReasons: any[],
  ): void {
    logger.error(
      'All attempts to add members to project failed',
      {
        who: requestingUserId,
        where: 'AddMemberService.execute',
        what: 'all_members_addition_failed',
        why: 'no_members_could_be_added',
        projectId: projectId,
        membersAttempted: membersAttempted,
        failureReasons: failureReasons,
      }
    )
  }

  export function eventDispatched(
    logger: LoggerService,
    projectId: string,
    fulfilledCount: number,
  ): void {
    logger.log(
      'Project add_member event dispatched for broker',
      {
        who: 'system_process',
        where: 'AddMemberService.execute',
        what: 'event_dispatch_success',
        why: 'member_addition_notification_sent',
        projectId: projectId,
        membersAddedCount: fulfilledCount,
      }
    )
  }
}