import chalk from 'chalk';
import fsExtra from 'fs-extra';
import ora from 'ora';
import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import { PKG_ROOT } from '~/consts.js';
import { getMongoEngineChangeParams } from '~/utils/changeParams.js';
import { logger } from '~/utils/logger.js';
import { format } from '~/utils/prettierFormat.js';

export const addMongoEngine = ({ projectName }: { projectName: string }) => {
  // The project files are copied while installing packages for sql in installers/sql.ts

  logger.info('Adding Mongo engine...');
  const spinner = ora(`Adding Mongo engine...\n`).start();

  try {
    spinner.start();
    const projectDir = projectName;
    const project = new Project();
    copyMongoFiles(projectDir);
    project.addSourceFilesAtPaths(projectDir + '/**');

    const modulePath = projectDir + '/src/modules/common.module.ts';

    updateCommonModule(modulePath, project);
    updateRedisIntercepter(modulePath, project);
    updateRedisService(modulePath, project);

    spinner.info(
      `Changing default app engine to ${chalk.cyan.bold('Mongo')}\n`,
    );
    changeDefaultEngine(projectDir + '/src/app.config.ts', project);

    project.saveSync();

    format(modulePath);
  } catch (error) {
    spinner.fail('Error occurred while adding mongo engine files.');
    logger.error(error);
    process.exit(1);
  }
};

const updateRedisIntercepter = (modulePath: string, project: Project) => {
  const intercepter = project.getSourceFileOrThrow(modulePath);

  const changeParams = getMongoEngineChangeParams()['commonModule'];
  for (const param of changeParams.socketAdapter) {
    intercepter.addImportDeclaration({
      moduleSpecifier: param.path,
      namedImports: [param.name],
    });
  }
  intercepter.fixUnusedIdentifiers();
};

const updateRedisService = (modulePath: string, project: Project) => {
  const service = project.getSourceFileOrThrow(modulePath);

  const changeParams = getMongoEngineChangeParams()['commonModule'];
  for (const param of changeParams.socketAdapter) {
    service.addImportDeclaration({
      moduleSpecifier: param.path,
      namedImports: [param.name],
    });
  }
  service.fixUnusedIdentifiers();
};

const updateCommonModule = (modulePath: string, project: Project) => {
  const commonModule = project.getSourceFileOrThrow(modulePath);
  const classDeclaration = commonModule.getClassOrThrow('CommonModule');
  const registerFunction = classDeclaration.getStaticMethodOrThrow('register');
  const modulesVariableDeclration =
    registerFunction.getVariableDeclarationOrThrow('modules');

  const variableDecleration =
    modulesVariableDeclration.getInitializerIfKindOrThrow(
      SyntaxKind.ArrayLiteralExpression,
    );
  const providersVariableDeclaration =
    registerFunction.getVariableDeclarationOrThrow('providers');
  const providersInitializer =
    providersVariableDeclaration.getInitializerIfKindOrThrow(
      SyntaxKind.ArrayLiteralExpression,
    );
  const changeParams = getMongoEngineChangeParams()['commonModule'];
  for (const param of changeParams.modules) {
    commonModule.addImportDeclaration({
      moduleSpecifier: param.path,
      namedImports: [param.name],
    });
    variableDecleration.addElement(param.name);
  }

  for (const param of changeParams.providers) {
    commonModule.addImportDeclaration({
      moduleSpecifier: param.classPath,
      namedImports: [param.class],
    });
    providersInitializer.addElement(
      `{provide: ${param.provide}, useClass: ${param.class}}`,
    );
  }

  commonModule.fixUnusedIdentifiers();
};

const changeDefaultEngine = (configPath: string, project: Project) => {
  const appConfig = project.getSourceFileOrThrow(configPath);
  const defaultEngineDeclaration =
    appConfig.getVariableDeclarationOrThrow('defaultEngine');
  const initializer = defaultEngineDeclaration.getInitializerOrThrow(
    'defaultEngine initiazer not found!',
  );
  initializer.replaceWithText('AppEngine.Mongo');
};

const copyMongoFiles = (projectDir: string) => {
  const decDir = path.join(PKG_ROOT, 'template/extras/decorators/mongo');
  const modDir = path.join(PKG_ROOT, 'template/extras/modules/mongo');
  const seedsDir = path.join(PKG_ROOT, 'template/extras/seeds/mongo');

  const appGatewayTemplate = path.join(
    PKG_ROOT,
    'template/extras/app.gateway.mongo.ts',
  );
  const socketAdapterDir = path.join(
    PKG_ROOT,
    'template/extras/socket-adapters/socket-state-mongo.adapter.ts',
  );

  const sqlDecDest = path.join(projectDir, 'src/core/decorators/mongo');
  const sqlModDest = path.join(projectDir, 'src/modules/mongo');
  const appGateway = path.join(projectDir, 'src/app.gateway.ts');
  const seedsDest = path.join(projectDir, 'src/seeds/mongo');
  const socketAdapterDest = path.join(
    projectDir,
    'src/core/modules/socket/socket-state/socket-state-mongo.adapter.ts',
  );

  fsExtra.copySync(decDir, sqlDecDest, { overwrite: true });
  fsExtra.copySync(modDir, sqlModDest, { overwrite: true });
  fsExtra.copySync(seedsDir, seedsDest, { overwrite: true });
  fsExtra.copySync(appGatewayTemplate, appGateway, { overwrite: true });
  fsExtra.copySync(socketAdapterDir, socketAdapterDest, { overwrite: true });
};
