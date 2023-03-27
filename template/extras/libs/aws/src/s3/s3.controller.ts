import { Controller } from '@nestjs/common';
import { MsListener } from 'src/core/core.decorators';
import { Job, JobResponse } from 'src/core/core.job';
import { MsClientService } from 'src/core/modules/ms-client/ms-client.service';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(
    private readonly s3Service: S3Service,
    private client: MsClientService,
  ) {}

  /**
   * Queue listener for S3
   */
  @MsListener('controller.s3')
  async execute(job: Job): Promise<void> {
    const response = await this.s3Service[job.action]<JobResponse>(
      new Job(job),
    );
    await this.client.jobDone(job, response);
  }
}
