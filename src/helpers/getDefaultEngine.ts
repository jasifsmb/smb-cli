import inquirer from 'inquirer';
import { Project } from 'ts-morph';

interface GetDefaultEngineOptions {
  projectDir: string;
}

export const getDefaultEngine = (
  options: GetDefaultEngineOptions,
): 'sql' | 'mongo' => {
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

  return defaultEngine.toLocaleLowerCase() as 'sql' | 'mongo';
};

export const promptDefaultEngine = async (): Promise<'sql' | 'mongo'> => {
  const { defaultEngine } = await inquirer.prompt<{
    defaultEngine: 'sql' | 'mongo';
  }>({
    name: 'defaultEngine',
    type: 'list',
    message: 'Choose the default database engnie',
    choices: [
      {
        key: 'm',
        name: 'Mongo',
        value: 'mongo',
      },
      {
        key: 's',
        name: 'SQL',
        value: 'sql',
      },
    ],
  });

  return defaultEngine;
};
