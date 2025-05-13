export enum ProjectStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  ARCHIVED = 'archived',
}

export const StatusTransitions: Partial<Record<ProjectStatus, ProjectStatus[]>> = {
  [ProjectStatus.ACTIVE]: [ProjectStatus.COMPLETED, ProjectStatus.CANCELED],
  [ProjectStatus.COMPLETED]: [ProjectStatus.ACTIVE],
  [ProjectStatus.CANCELED]: [ProjectStatus.ACTIVE],
  [ProjectStatus.ARCHIVED]: [],
}

export const ForbiddenStatus = [
  ProjectStatus.CANCELED,
  ProjectStatus.COMPLETED,
  ProjectStatus.ARCHIVED,
]