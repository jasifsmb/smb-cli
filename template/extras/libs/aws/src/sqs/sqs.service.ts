import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQS } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';
import { Job } from 'src/core/core.job';

@Injectable()
export class SQSService {
  constructor(
    @InjectAwsService(SQS) public readonly sqs: SQS,
    private configService: ConfigService,
  ) {}

  async sendMessage(job: Job) {
    try {
      const data = await this.sqs.sendMessage(job.payload).promise();
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async deleteMessage(job: Job) {
    try {
      const data = await this.sqs.deleteMessage(job.payload).promise();
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async getQueueUrl(QueueName: string): Promise<string> {
    try {
      const data = await this.sqs
        .getQueueUrl({ QueueName, ...this.configService.get('sqs') })
        .promise();
      return data.QueueUrl;
    } catch (error) {
      return '';
    }
  }
}
