import { Seed } from '@core/sql/seeder/seeder.dto';
import countrySeed from './country.seed';
import pageSeed from './page.seed';
import productSeed from './product.seed';
import roleSeed from './role.seed';
import settingSeed from './setting.seed';
import stateSeed from './state.seed';
import templateSeed from './template.seed';
import userSeed from './user.seed';

const seeds: Seed[] = [
  roleSeed,
  userSeed,
  productSeed,
  settingSeed,
  pageSeed,
  countrySeed,
  stateSeed,
  templateSeed,
];

export default seeds;
