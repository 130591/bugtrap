import { Injectable, Logger } from '@nestjs/common'
import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { ExternalIdentityClient } from '@src/project/http/client'
import { EmailBox } from '@src/shared/lib/emailbox'

@Injectable()
@Processor('send.intitation.confirm.mailer')
export class CreateConfirmedMember extends WorkerHost {
	private readonly logger = new Logger(CreateConfirmedMember.name)

	constructor(
		private readonly mail: EmailBox,
		private readonly publicApi: ExternalIdentityClient
	) {
	  super()
	}

	async process(job: Job<any>): Promise<void> {
	  console.log('event', job.data)
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
