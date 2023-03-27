import { ModelService, SqlService } from '@core/sql';
import { Injectable } from '@nestjs/common';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService extends ModelService<Role> {
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = ['name'];

  constructor(db: SqlService<Role>) {
    super(db);
  }
}
