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
