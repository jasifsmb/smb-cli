import { Seed } from '@core/sql/seeder/seeder.dto';

const seed: Seed = {
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

export default seed;
