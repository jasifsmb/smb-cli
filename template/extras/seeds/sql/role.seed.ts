import { Seed } from '@core/sql/seeder/seeder.dto';
import { Role } from '../../modules/sql/role/entities/role.entity';

export default <Seed<Role>>{
  model: 'Role',
  action: 'once',
  data: [
    {
      name: 'Admin',
    },
    {
      name: 'User',
    },
  ],
};
