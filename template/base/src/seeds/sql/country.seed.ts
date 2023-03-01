import { Seed } from '@core/sql/seeder/seeder.dto';

const seed: Seed = {
  model: 'Country',
  action: 'once',
  data: [
    {
      name: 'United States',
      code: 'US',
    },
  ],
};

export default seed;
