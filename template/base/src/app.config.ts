export enum AppEngine {
  SQL = 'sql',
  Mongo = 'mongo',
}

export const defaultEngine: AppEngine = AppEngine.Mongo;
