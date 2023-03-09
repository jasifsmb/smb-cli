import { ModelService, ModelType } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Template } from './entities/template.entity';

@Injectable()
export class TemplateService extends ModelService {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'title'];

  constructor(@InjectModel(Template) model: ModelType<Template>) {
    super(model);
  }
}
