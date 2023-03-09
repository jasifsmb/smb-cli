import { ModelService } from '@core/mongo';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { State, StateDocument } from './entities/state.entity';

@Injectable()
export class StateService extends ModelService {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', '$country.name$'];

  /**
   * searchPopulate
   * @property array of associations to include for search
   */
  searchPopulate: string[] = ['country'];

  constructor(@InjectModel(State.name) model: Model<StateDocument>) {
    super(model);
  }
}
