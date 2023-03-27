import chalk from 'chalk';
import fsExtra from 'fs-extra';
import ora from 'ora';
import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import { PKG_ROOT } from '~/consts.js';
import { getSQLEngineChangeParams } from '~/utils/changeParams.js';
import { logger } from '~/utils/logger.js';
import { format } from '~/utils/prettierFormat.js';

export const addSQLEngine = ({ projectName }: { projectName: string }) => {
  // The project files are copied while installing packages for sql in installers/sql.ts

  logger.info('Adding SQL engine...');
  const spinner = ora(`Adding SQL engine...\n`).start();

  try {
    spinner.start();
    const projectDir = projectName;
    const project = new Project();
    copySQLFiles(projectDir);
    const pkgJson = fsExtra.readJSONSync(path.join(projectDir, 'package.json'));
    pkgJson.jest.moduleNameMapper = {
      ...pkgJson.jest.moduleNameMapper,
      '^@core/sql(|/.*)$': '<rootDir>/libs/sql/src/$1',
    };
    fsExtra.writeJSONSync(path.join(projectDir, 'package.json'), pkgJson, {
      spaces: 2,
    });
    const tsConfig = fsExtra.readJSONSync(
      path.join(projectDir, 'tsconfig.json'),
    );
    tsConfig.paths = {
      ...tsConfig.paths,
      '@core/sql': ['libs/sql/src'],
      '@core/sql/*': ['libs/sql/src/*'],
    };
    fsExtra.writeJSONSync(path.join(projectDir, 'tsconfig.json'), tsConfig, {
      spaces: 2,
    });
    project.addSourceFilesAtPaths(projectDir + '/**');

    const modulePath = projectDir + '/src/modules/common.module.ts';

    updateCommonModule(modulePath, project);

    spinner.info(`Changing default app engine to ${chalk.cyan.bold('SQL')}\n`);
    changeDefaultEngine(projectDir + '/src/app.config.ts', project);

    project.saveSync();

    format(modulePath);
  } catch (error) {
    spinner.fail('Error occurred while adding sql engine files.');
    logger.error(error);
    process.exit(1);
  }
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
  const changeParams = getSQLEngineChangeParams()['commonModule'];
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
  initializer.replaceWithText('AppEngine.SQL');
};

const copySQLFiles = (projectDir: string) => {
  const libsDir = path.join(PKG_ROOT, 'template/extras/libs/sql');
  const decDir = path.join(PKG_ROOT, 'template/extras/decorators/sql');
  const modDir = path.join(PKG_ROOT, 'template/extras/modules/sql');
  const seedsDir = path.join(PKG_ROOT, 'template/extras/seeds/sql');
  const socketAdapterDir = path.join(
    PKG_ROOT,
    'template/extras/socket-adapters/socket-state.adapter.ts',
  );

  const appGatewayTemplate = path.join(
    PKG_ROOT,
    'template/extras/app.gateway.sql.ts',
  );

  const sqlLibsDest = path.join(projectDir, 'libs/sql');
  const sqlDecDest = path.join(projectDir, 'src/core/decorators/sql');
  const sqlModDest = path.join(projectDir, 'src/modules/sql');
  const appGateway = path.join(projectDir, 'src/app.gateway.ts');
  const seedsDest = path.join(projectDir, 'src/seeds/sql');
  const socketAdapterDest = path.join(
    projectDir,
    'src/core/modules/socket/socket-state/socket-state.adapter.ts',
  );

  fsExtra.copySync(libsDir, sqlLibsDest, { overwrite: true });
  fsExtra.copySync(decDir, sqlDecDest, { overwrite: true });
  fsExtra.copySync(modDir, sqlModDest, { overwrite: true });
  fsExtra.copySync(seedsDir, seedsDest, { overwrite: true });
  fsExtra.copySync(appGatewayTemplate, appGateway, { overwrite: true });
  fsExtra.copySync(socketAdapterDir, socketAdapterDest, { overwrite: true });
};
