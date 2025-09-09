import { ProjectStatus } from "../../constants"

export interface BasePolicy<T> {
  canAllow(entity: T, userId: string): PolicyResult
  getName(): string
}


export interface MembershipPolicy {
  canMembership(status: ProjectStatus, currentMemberIds: string[], newMemberIds: string[]): PolicyResult
  getName(): string
}

export interface PolicyResult {
  allowed: boolean
  reason?: string
  exception?: new (...args: any[]) => Error
}