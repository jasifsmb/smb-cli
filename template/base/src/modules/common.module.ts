import { DynamicModule, Module } from "@nestjs/common";
import { AppEngine } from "../app.config";
import { ProductModule as ProductMongoModule } from "./mongo/product/product.module";
import { RoleModule as RoleMongoModule } from "./mongo/role/role.module";
import { UserModule as UserMongoModule } from "./mongo/user/user.module";

export interface CommonModuleOption {
  defaultEngine?: AppEngine;
}

@Module({})
export class CommonModule {
  static register(): DynamicModule {
    const modules = [ProductMongoModule, RoleMongoModule, UserMongoModule];
    return {
      module: CommonModule,
      imports: modules,
    };
  }
}
