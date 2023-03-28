import { Seed } from '@core/mongo/seeder/seeder.dto';
import userSeed from './user.seed';

const seeds: Seed<any>[] = [userSeed];

export default seeds;
