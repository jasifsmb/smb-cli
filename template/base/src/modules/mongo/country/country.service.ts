import { ModelService } from '@core/mongo';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country, CountryDocument } from './entities/country.entity';

@Injectable()
export class CountryService extends ModelService {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(@InjectModel(Country.name) model: Model<CountryDocument>) {
    super(model);
  }
}
