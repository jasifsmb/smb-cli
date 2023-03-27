import { type AvailablePackages } from '~/installers/index.js';

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
      moduleSpecifier: '@core/sql',
      namedImports: ['SqlModule'],
      importElement: 'SqlModule.root({ seeder: true })',
    },
  };
};

export const getMongoEngineChangeParams = () => ({
  commonModule: {
    modules: [
      {
        name: 'AuthModule',
        alias: 'MongoAuthModule',
        path: './mongo/auth/auth.module',
      },
      {
        name: 'LocalAuthModule',
        alias: 'MongoLocalAuthModule',
        path: './mongo/auth/auth.module',
      },
      {
        name: 'RoleModule',
        alias: 'RoleMongoModule',
        path: './mongo/auth/auth.module',
      },
      {
        name: 'UserModule',
        alias: 'UserMongoModule',
        path: './mongo/auth/auth.module',
      },
      {
        name: 'PageModule',
        alias: 'PageMongoModule',
        path: './mongo/auth/auth.module',
      },
      {
        name: 'TemplateModule',
        alias: 'TemplateMongoModule',
        path: './mongo/auth/auth.module',
      },
      {
        name: 'SettingModule',
        alias: 'SettingMongoModule',
        path: './mongo/auth/auth.module',
      },
      {
        name: 'NotificationModule',
        alias: 'MongoNotificationModule',
        path: './mongo/auth/auth.module',
      },
    ],
    providers: [
      {
        provide: 'APP_GUARD',
        class: 'JwtAuthGuard',
        classPath: './mongo/auth/strategies/jwt/jwt-auth.guard',
        alias: 'MongoJwtAuthGuard',
      },
      {
        provide: 'APP_GUARD',
        class: 'RolesGuard',
        classPath: './mongo/auth/roles.guard',
        alias: 'MongoRolesGuard',
      },
    ],
  },
});

export const getSQLEngineChangeParams = () => ({
  commonModule: {
    modules: [
      { name: 'AuthModule', path: './sql/auth/auth.module' },
      {
        name: 'LocalAuthModule',
        path: './sql/auth/strategies/local/local-auth.module',
      },
      { name: 'CountryModule', path: './sql/country/country.module' },
      { name: 'PageModule', path: './sql/page/page.module' },
      {
        name: 'NotificationModule',
        path: './sql/notification/notification.module',
      },
      { name: 'RoleModule', path: './sql/role/role.module' },
      { name: 'SettingModule', path: './sql/setting/setting.module' },
      { name: 'StateModule', path: './sql/state/state.module' },
      { name: 'TemplateModule', path: './sql/template/template.module' },
      { name: 'UserModule', path: './sql/user/user.module' },
    ],
    providers: [
      {
        provide: 'APP_GUARD',
        class: 'JwtAuthGuard',
        classPath: './sql/auth/strategies/jwt/jwt-auth.guard',
      },
      {
        provide: 'APP_GUARD',
        class: 'RolesGuard',
        classPath: './sql/auth/roles.guard',
      },
    ],
  },
  appGateway: [
    { name: 'UserModule', path: './modules/sql/user/user.module' },
    { name: 'UserService', path: './modules/sql/user/user.service' },
  ],
  job: [
    { name: 'BulkCreateOptions', path: 'sequalize' },
    { name: 'CountOptions', path: 'sequalize' },
    { name: 'CreateOptions', path: 'sequalize' },
    { name: 'DestroyOptions', path: 'sequalize' },
    { name: 'FindAndCountOptions', path: 'sequalize' },
    { name: 'FindOptions', path: 'sequalize' },
    { name: 'FindOrBuildOptions', path: 'sequalize' },
    { name: 'FindOrCreateOptions', path: 'sequalize' },
  ],
});
