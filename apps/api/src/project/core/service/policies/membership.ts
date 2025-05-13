import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common"
import { ForbiddenStatus, ProjectStatus } from "../../constants"

const MAX_MEMBERS_PER_PROJECT = 50

export namespace Membership {
  export function ensureNotAlreadyMembers(existingMemberIds: string[], newMemberIds: string[]) {
    const alreadyMembers = newMemberIds.filter(id => existingMemberIds.includes(id))
    if (alreadyMembers.length) {
      throw new ConflictException('Some users are already members of the project')
    }
  }

  export function ensureProjectHasCapacity(currentCount: number, toAdd: number) {
    if (currentCount + toAdd > MAX_MEMBERS_PER_PROJECT) {
      throw new BadRequestException(`Cannot add more than ${MAX_MEMBERS_PER_PROJECT} members`)
    }
  }

  export function ensureCanAcceptMembers(status: ProjectStatus) {
    if (ForbiddenStatus.includes(status)) {
      throw new ForbiddenException('Unable to add a new member to the project')
    }
  }

  export function checkPolicies(
    status: ProjectStatus,
    existingMemberIds: string[],
    newMemberIds: string[],
  ) {
    ensureCanAcceptMembers(status)
    ensureNotAlreadyMembers(existingMemberIds, newMemberIds)
    ensureProjectHasCapacity(existingMemberIds.length, newMemberIds.length)
  }
}
