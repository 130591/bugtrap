import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { PROJECT_CREATED_PROCESSING_QUEUE } from '@src/shared/event'
import { ExternalIdentityClient } from '@src/project/http/client'
import { EmailBox } from '@src/shared/lib/emailbox'

@Injectable()
@Processor('order-confirmation-email')
export class NotificationOwner extends WorkerHost {
  private readonly logger = new Logger(NotificationOwner.name)

  constructor(
    private readonly mail: EmailBox,
    private readonly publicApi: ExternalIdentityClient
  ) {
    super()
  }

  async process(job: Job<{ ownerId: string; title: string }>): Promise<any> {
    const ownerInfo = await this.publicApi.findUserById(job.data.ownerId)

    if (!ownerInfo || !ownerInfo.email) {
      throw new BadRequestException('Owner not found or email missing')
    }

    const subject = `You are included as an owner in a new project: ${job.data.title}`
    const body = `You are a new owner of the project titled "${job.data.title}".`

    await this.mail.sendEmail(ownerInfo.email, subject, body)
    this.logger.log(`Email successfully sent to ${ownerInfo.email} for project: ${job.data.title}`)

    return { status: 'success', data: job.data }
  }

  @OnWorkerEvent('completed')
  onJobComplete() {
    this.logger.log('Job completed successfully')
  }

  @OnWorkerEvent('failed')
  onJobFailed(error: Error) {
    this.logger.error('Job failed', error.stack)
  }
}
