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
    email: {
      moduleSpecifier: '@core/email',
      namedImports: ['EmailModule'],
      importElement: 'EmailModule',
    },
    recaptcha: {
      moduleSpecifier: '@core/recaptcha',
      namedImports: ['RecaptchaModule'],
      importElement: 'RecaptchaModule',
    },
    twilio: {
      moduleSpecifier: '@core/twilio',
      namedImports: ['TwilioModule'],
      importElement: 'TwilioModule',
    },
    geocoder: {
      moduleSpecifier: '@core/geocoder',
      namedImports: ['GeocoderModule'],
      importElement: 'GeocoderModule',
    },
    firebase: {
      moduleSpecifier: '@core/firebase',
      namedImports: ['FirebaseModule'],
      importElement: 'FirebaseModule',
    },
    stripe: {
      moduleSpecifier: '@core/stripe',
      namedImports: ['StripeModule'],
      importElement: 'StripeModule',
    },
  };
};

export const getMongoEngineChangeParams = () => ({
  commonModule: {
    modules: [
      {
        name: 'AuthModule',
        path: './mongo/auth/auth.module',
      },
      {
        name: 'LocalAuthModule',
        path: './mongo/auth/strategies/local/local-auth.module',
      },
      {
        name: 'UserModule',
        path: './mongo/user/user.module',
      },
      {
        name: 'PageModule',
        path: './mongo/page/page.module',
      },
      {
        name: 'TemplateModule',
        path: './mongo/template/template.module',
      },
      {
        name: 'SettingModule',
        path: './mongo/setting/setting.module',
      },
      {
        name: 'NotificationModule',
        path: './mongo/notification/notification.module',
      },
    ],
    providers: [
      {
        provide: 'APP_GUARD',
        class: 'JwtAuthGuard',
        classPath: './mongo/auth/strategies/jwt/jwt-auth.guard',
      },
      {
        provide: 'APP_GUARD',
        class: 'RolesGuard',
        classPath: './mongo/auth/roles.guard',
      },
      {
        provide: 'APP_INTERCEPTOR',
        providerPath: '@nestjs/core',
        class: 'SettingsInterceptor',
        classPath: 'src/core/interceptors/mongo/settings.interceptors',
      },
    ],
    socketAdapter: [
      {
        name: 'AuthenticatedSocket',
        path: '../socket-state/socket-state-mongo.adapter',
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
      {
        provide: 'APP_INTERCEPTOR',
        providerPath: '@nestjs/core',
        class: 'SettingsInterceptor',
        classPath: 'src/core/interceptors/sql/settings.interceptors',
      },
    ],
    socketAdapter: [
      {
        name: 'AuthenticatedSocket',
        path: '../socket-state/socket-state.adapter',
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
