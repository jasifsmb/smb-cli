import { ModelService } from '@core/mongo';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template, TemplateDocument } from './entities/template.entity';

@Injectable()
export class TemplateService extends ModelService {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'title'];

  constructor(@InjectModel(Template.name) model: Model<TemplateDocument>) {
    super(model);
  }
}
