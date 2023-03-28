import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService as NestTwilioService } from 'nestjs-twilio';
import { Job } from 'src/core/core.job';

@Injectable()
export class TwilioService {
  public constructor(
    private readonly twilioService: NestTwilioService,
    private config: ConfigService,
  ) {}

  async sendSMS(job: Job) {
    let error = false,
      data = null;
    try {
      data = await this.twilioService.client.messages.create({
        from: this.config.get('twilio')?.from,
        body: job.payload.body,
        to: job.payload.to,
      });
    } catch (err) {
      error = err;
    }
    return { error, data };
  }
}
