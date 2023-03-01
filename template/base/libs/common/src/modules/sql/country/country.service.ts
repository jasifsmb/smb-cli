import { ModelService, ModelType } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Country } from './entities/country.entity';

@Injectable()
export class CountryService extends ModelService {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(@InjectModel(Country) model: ModelType<Country>) {
    super(model);
  }
}
