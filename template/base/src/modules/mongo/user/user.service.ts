import { ModelService } from '@core/mongo';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'src/core/core.job';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService extends ModelService {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'email'];

  constructor(@InjectModel(User.name) model: Model<UserDocument>) {
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
  }
}
