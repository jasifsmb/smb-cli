import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as NodeGeocoder from 'node-geocoder';
import { Job } from 'src/core/core.job';

@Injectable()
export class GeocoderService {
  private geocoder: any;

  constructor(configService: ConfigService) {
    this.geocoder = NodeGeocoder(configService.get('geocoder'));
  }

  async geocode(job: Job) {
    let error = false,
      data = null;

    try {
      data = await this.geocoder.geocode(job.payload);
    } catch (err) {
      error = err;
    }
    return { error, data };
  }

  async reverse(job: Job) {
    let error = false,
      data = null;

    try {
      data = await this.geocoder.reverse(job.payload);
    } catch (err) {
      error = err;
    }
    return { error, data };
  }
}
