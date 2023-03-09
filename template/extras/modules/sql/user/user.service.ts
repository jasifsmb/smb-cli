import { ModelService, ModelType } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';

@Injectable()
export class UserService extends ModelService {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name', 'email'];

  constructor(@InjectModel(User) model: ModelType<User>) {
    super(model);
  }
}
