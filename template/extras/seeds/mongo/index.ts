import { Seed } from '@core/mongo/seeder/seeder.dto';
import countrySeed from './country.seed';
import pageSeed from './page.seed';
import stateSeed from './state.seed';
import userSeed from './user.seed';

const seeds: Seed<any>[] = [userSeed, pageSeed, countrySeed, stateSeed];

export default seeds;
