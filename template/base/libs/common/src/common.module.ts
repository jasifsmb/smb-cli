import { DynamicModule, Module } from '@nestjs/common';
import { AppEngine } from '../../../src/app.config';
import { CommonService } from './common.service';
import { ProductModule as ProductMongoModule } from './modules/mongo/product/product.module';
import { CountryModule } from './modules/sql/country/country.module';
import { PageModule } from './modules/sql/page/page.module';
import { ProductModule } from './modules/sql/product/product.module';
import { RoleModule } from './modules/sql/role/role.module';
import { SettingModule } from './modules/sql/setting/setting.module';
import { StateModule } from './modules/sql/state/state.module';
import { TemplateModule } from './modules/sql/template/template.module';
import { UserModule } from './modules/sql/user/user.module';

export interface CommonModuleOption {
  defaultEngine?: AppEngine;
}

@Module({})
export class CommonModule {
  static register(options?: CommonModuleOption): DynamicModule {
    const imports = [];
    if (options && options.defaultEngine === AppEngine.Mongo) {
      imports.push(ProductMongoModule);
    } else {
      const modules = [
        ProductModule,
        RoleModule,
        UserModule,
        PageModule,
        TemplateModule,
        SettingModule,
        CountryModule,
        StateModule,
      ];
      imports.push(...modules);
    }
    return {
      module: CommonModule,
      imports,
      providers: [CommonService],
    };
  }
}
