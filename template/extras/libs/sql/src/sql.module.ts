import { Op } from 'sequelize';

import { DynamicModule, Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { SeederModule } from './seeder/seeder.module';

export const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $or: Op.or,
};

export interface SqlModuleOption {
  seeder?: boolean;
}

@Module({})
export class SqlModule {
  static register(options?: SqlModuleOption): DynamicModule {
    const imports = [];
    imports.push(DatabaseModule);
    if (options && options.seeder) {
      imports.push(SeederModule);
    }
    return {
      module: SqlModule,
      imports,
    };
  }
}
