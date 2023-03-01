import { Seed } from '@core/sql/seeder/seeder.dto';

export default <Seed>{
  model: 'Product',
  action: 'once',
  data: [
    {
      name: 'Pen',
      description: 'Pen is used to write something.',
      active: true,
    },
  ],
};
