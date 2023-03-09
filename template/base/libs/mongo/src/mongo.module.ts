import { DynamicModule, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { SeederModule } from './seeder/seeder.module';

export interface MongoModuleOption {
  seeder?: boolean;
}

@Module({})
export class MongoModule {
  static register(options?: MongoModuleOption): DynamicModule {
    const imports = [];
    imports.push(DatabaseModule);
    if (options && options.seeder) {
      imports.push(SeederModule);
    }
    return {
      module: MongoModule,
      imports,
    };
  }
}
