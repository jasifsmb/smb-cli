import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';
import { Job } from 'src/core/core.job';

@Injectable()
export class S3Service {
  constructor(@InjectAwsService(S3) public readonly s3: S3) {}

  async upload(job: Job) {
    try {
      const data = await this.s3.putObject(job.payload).promise();
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async delete(job: Job) {
    try {
      const data = await this.s3.deleteObject(job.payload).promise();
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async getSignedURL(job: Job) {
    try {
      const data = await this.s3.getSignedUrlPromise(
        job.payload.operation,
        job.payload.params,
      );
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async createBucket(job: Job) {
    try {
      const data = await this.s3.createBucket(job.payload).promise();
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
