import { BackoffOptions } from "bullmq"


export const PROJECT_CREATED_PROCESSING_QUEUE = 'project.created'

export const NOTIFY_OWNER_PROCESSING_QUEUE = 'notify_owner:processing'
export const NOTIFY_OWNER_PROCESSING_QUEUE_ATTEMPTS = 3
export const NOTIFY_OWNER_PROCESSING_QUEUE_BACKOFF: BackoffOptions = {
  type: 'exponential',
  delay: 1_000
}
