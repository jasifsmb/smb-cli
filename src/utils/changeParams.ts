import { type AvailablePackages } from "~/installers/index.js";

type AppModuleUtils = {
  [x in AvailablePackages]: {
    moduleSpecifier: string;
    namedImports: string[];
    importElement: string;
  };
};
export const getAppModuleChangeParams = (): AppModuleUtils => {
  return {
    sql: {
      moduleSpecifier: "@core/sql",
      namedImports: ["SqlModule"],
      importElement: "SqlModule.register({ seeder: true })",
    },
  };
};

export const getSQLEngineChangeParams = () => ({
  commonModule: [
    { name: "CountryModule", path: "./sql/country/country.module" },
    { name: "PageModule", path: "./sql/page/page.module" },
    { name: "ProductModule", path: "./sql/product/product.module" },
    { name: "RoleModule", path: "./sql/role/role.module" },
    { name: "SettingModule", path: "./sql/setting/setting.module" },
    { name: "StateModule", path: "./sql/state/state.module" },
    { name: "TemplateModule", path: "./sql/template/template.module" },
    { name: "UserModule", path: "./sql/user/user.module" },
  ],
  appGateway: [
    { name: "UserModule", path: "./modules/sql/user/user.module" },
    { name: "UserService", path: "./modules/sql/user/user.service" },
  ],
  job: [
    { name: "BulkCreateOptions", path: "sequalize" },
    { name: "CountOptions", path: "sequalize" },
    { name: "CreateOptions", path: "sequalize" },
    { name: "DestroyOptions", path: "sequalize" },
    { name: "FindAndCountOptions", path: "sequalize" },
    { name: "FindOptions", path: "sequalize" },
    { name: "FindOrBuildOptions", path: "sequalize" },
    { name: "FindOrCreateOptions", path: "sequalize" },
  ],
});
