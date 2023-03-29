import { Project } from 'ts-morph';

interface GetDefaultEngineOptions {
  projectDir: string;
}

export const getDefaultEngine = (options: GetDefaultEngineOptions) => {
  const { projectDir } = options;
  const appConfigPath = projectDir + '/src/app.config.ts';
  const project = new Project();
  const appConfig = project.addSourceFileAtPath(appConfigPath);
  const defaultEngineDeclaration =
    appConfig.getVariableDeclarationOrThrow('defaultEngine');
  const initializer = defaultEngineDeclaration.getInitializerOrThrow(
    'defaultEngine initiazer not found!',
  );
  const value = initializer.getText();
  const defaultEngine = value.split('.')[1] as 'SQL' | 'Mongo';

  return defaultEngine;
};
