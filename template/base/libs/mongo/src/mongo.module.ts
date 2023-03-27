import { DynamicModule, Module } from '@nestjs/common';
import {
  AsyncModelFactory,
  ModelDefinition,
  MongooseModule,
} from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { MongoService } from './mongo.service';
import { SeederModule } from './seeder/seeder.module';

export interface MongoModuleOption {
  seeder?: boolean;
}

export interface MongoOption {
  history?: boolean;
  historyExpireIn?: number;
  trashExpireIn?: number;
}

@Module({})
export class MongoModule {
  static root(options?: MongoModuleOption): DynamicModule {
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

  static register(
    option: ModelDefinition,
    options?: MongoOption,
    connectionName?: string,
  ): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [MongooseModule.forFeature([option], connectionName)],
      providers: [
        {
          provide: 'MODEL_NAME',
          useValue: option.name,
        },
        {
          provide: 'MODEL_OPTIONS',
          useValue: options || {},
        },
        MongoService,
      ],
      exports: [MongoService],
    };
  }

  static registerAsync(
    option: AsyncModelFactory,
    options?: MongoOption,
    connectionName?: string,
  ): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [MongooseModule.forFeatureAsync([option], connectionName)],
      providers: [
        {
          provide: 'MODEL_NAME',
          useValue: option.name,
        },
        {
          provide: 'MODEL_OPTIONS',
          useValue: options || {},
        },
        MongoService,
      ],
      exports: [MongoService],
    };
  }
}
