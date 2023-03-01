import { DynamicModule, Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { MongoService } from './mongo.service';
import { SeederModule } from './seeder/seeder.module';

export interface MongoModuleOption {
  seeder?: boolean;
}

@Module({
  imports: [DatabaseModule, SeederModule],
  providers: [MongoService],
  exports: [MongoService],
})
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
