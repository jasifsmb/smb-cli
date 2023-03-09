import { ModelService } from '@core/mongo';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'src/core/core.job';
import { Page, PageDocument } from './entities/page.entity';

@Injectable()
export class PageService extends ModelService {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'title'];

  constructor(@InjectModel(Page.name) model: Model<PageDocument>) {
    super(model);
  }

  /**
   * doBeforeWrite
   * @function function will execute before create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeWrite(job: Job): Promise<void> {
    await super.doBeforeWrite(job);
    if (job.action === 'update') {
      delete job.body?.name;
      delete job.body?.allow_html;
    }
  }
}
