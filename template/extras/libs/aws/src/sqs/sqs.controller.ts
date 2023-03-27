import { Controller } from '@nestjs/common';
import { MsListener } from 'src/core/core.decorators';
import { Job, JobResponse } from 'src/core/core.job';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { SQSService } from './sqs.service';

@Controller('sqs')
export class SQSController {
  constructor(
    private readonly sqsService: SQSService,
    private client: MsClientService,
  ) {}

  /**
   * Queue listener for SQS
   */
  @MsListener('controller.sqs')
  async execute(job: Job): Promise<void> {
    const response = await this.sqsService[job.action]<JobResponse>(
      new Job(job),
    );
    await this.client.jobDone(job, response);
  }
}
