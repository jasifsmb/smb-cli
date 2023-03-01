import { set } from 'mongoose';

import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

set('debug', process.env.MONGO_LOGGING === 'Y');

export default registerAs(
  'mongo',
  (): MongooseModuleOptions => ({
    uri: process.env.MONGO_URI || 'mongodb://localhost/nest',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }),
);
