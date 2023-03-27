import { ModelService, MongoService } from '@core/mongo';
import { Injectable } from '@nestjs/common';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService extends ModelService<Role> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: MongoService<Role>) {
    super(db);
  }
}
