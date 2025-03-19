import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { ExternalIdentityClient } from '@src/project/http/client'
import { EmailBox } from '@src/shared/lib/emailbox'

@Injectable()
@Processor('send-intitation-mailer')
export class InvitationMember extends WorkerHost {
	private readonly logger = new Logger(InvitationMember.name)

	constructor(
		private readonly mail: EmailBox,
		private readonly publicApi: ExternalIdentityClient
	) {
		super()
	}

	async process(job: Job<any>): Promise<void> {
		const subject = `You are included as an owner in a new project: ${job.data.title}`
		const body = `You are a new owner of the project titled "${job.data.title}".`

		await this.mail.sendEmail(job.data.guestEmail, subject, body)
		this.logger.log(`Email successfully sent to ${job.data.guestEmail} for project: ${job.data.title}`)
	}

	@OnWorkerEvent('completed')
	onJobComplete() {
		this.logger.log('Job completed successfully')
	}

	@OnWorkerEvent('failed')
	onJobFailed(error: Error) {
		console.log(error)
		this.logger.error('Job failed', error)
	}
}
