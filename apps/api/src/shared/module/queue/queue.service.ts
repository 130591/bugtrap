import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PROJECT_CREATED_PROCESSING_QUEUE } from '@src/shared/event';

@Injectable()
export class QueueService {
  // Queue injection can be done dynamically, allowing reuse
  constructor(@InjectQueue(PROJECT_CREATED_PROCESSING_QUEUE) private readonly queue: Queue) {}

  /**
   * Adds a job to the queue.
   * @param data - Data to be passed to the job.
   * @param jobName - Name of the job in the queue.
   * @param options - Additional options for the job (such as retries, backoff, etc.).
   */
  async addJob(jobName: string, data: any, options: any = {}) {
    await this.queue.add(jobName, data, {
      attempts: 3,
      backoff: 5000,
      ...options,
    });
  }
}
