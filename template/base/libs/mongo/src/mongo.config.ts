import { SchemaTypes } from 'mongoose';
import softDelete from './plugins/soft-delete';

import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { AppEngine, defaultEngine } from '../../../src/app.config';

export default registerAs(
  'mongo',
  (): MongooseModuleOptions => ({
    uri: process.env.MONGO_URI || 'mongodb://localhost/nest',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectionFactory: (connection) => {
      connection.plugin(softDelete, {
        deletedAt: 'deleted_at',
        deletedBy: {
          name: 'deleted_by',
          type:
            defaultEngine === AppEngine.Mongo ? SchemaTypes.ObjectId : Number,
        },
        overrideMethods: 'all',
        indexFields: ['deleted'],
      });
      return connection;
    },
  }),
);
