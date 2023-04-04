import chalk from 'chalk';
import fsExtra from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  Project,
} from 'ts-morph';
import { PKG_ROOT } from '~/consts.js';
import {
  getDefaultEngine,
  promptDefaultEngine,
} from '~/helpers/getDefaultEngine.js';
import { isProjectInitWithCli } from '~/utils/checkCurrentProject.js';
import { logger } from '~/utils/logger.js';
import { format } from '~/utils/prettierFormat.js';

interface ModuleCommandFlags {
  noSpec: boolean;
  useSql: boolean;
  useMongo: boolean;
}

export const moduleCommand = async (
  name: string,
  options: ModuleCommandFlags,
) => {
  let updateAppModule = true;
  const validNameRegex = /^[a-z]+(-[a-z]+)*$/;
  if (!validNameRegex.test(name)) {
    logger.error('Error: Invalid module name specified!');
    process.exit(1);
  }
  const projectDir = process.cwd();
  if (!isProjectInitWithCli({ projectDir })) {
    logger.error(`Error: looks like you are not running the command from the root.
    Please run the command inside the root folder of the project.`);
    process.exit(1);
  }

  const defaultEngine = getDefaultEngine({ projectDir });
  const destinationPath = path.join(
    projectDir,
    `src/modules/${defaultEngine}/${name}`,
  );
  const spinner = ora(`Scaffolding in: ${destinationPath}...\n`).start();
  if (fsExtra.existsSync(destinationPath)) {
    if (fsExtra.readdirSync(projectDir).length === 0) {
      if (name !== '.')
        spinner.info(
          `${chalk.cyan.bold(name)} exists but is empty, continuing...\n`,
        );
    } else {
      spinner.stopAndPersist();
      const { overwriteDir } = await inquirer.prompt<{
        overwriteDir: 'abort' | 'clear' | 'overwrite';
      }>({
        name: 'overwriteDir',
        type: 'list',
        message: `${chalk.redBright.bold('Warning:')} ${chalk.cyan.bold(
          name,
        )} already exists and isn't empty. How would you like to proceed?`,
        choices: [
          {
            name: 'Abort module creation (recommended)',
            value: 'abort',
            short: 'Abort',
          },
          {
            name: 'Clear the directory and continue module creation',
            value: 'clear',
            short: 'Clear',
          },
          {
            name: 'Continue module creation and overwrite conflicting files',
            value: 'overwrite',
            short: 'Overwrite',
          },
        ],
        default: 'abort',
      });
      if (overwriteDir === 'abort') {
        spinner.fail('Aborting module creation...');
        process.exit(1);
      }

      const overwriteAction =
        overwriteDir === 'clear'
          ? 'clear the directory'
          : 'overwrite conflicting files';

      const { confirmOverwriteDir } = await inquirer.prompt<{
        confirmOverwriteDir: boolean;
      }>({
        name: 'confirmOverwriteDir',
        type: 'confirm',
        message: `Are you sure you want to ${overwriteAction}?`,
        default: false,
      });

      if (!confirmOverwriteDir) {
        spinner.fail('Aborting module creation...');
        process.exit(1);
      }
      updateAppModule = false;

      if (overwriteDir === 'clear') {
        spinner.info(
          `Emptying ${chalk.cyan.bold(name)} and creating module..\n`,
        );
        fsExtra.emptyDirSync(destinationPath);
      }
    }
  }
  spinner.start();
  const sqlSampleModulePath = path.join(
    PKG_ROOT,
    'template/extras/modules/sql/country',
  );
  const mongoSampleModulePath = path.join(
    PKG_ROOT,
    'template/extras/modules/mongo/country',
  );

  let userDefinedDefaultEngine = options.useMongo
    ? 'mongo'
    : options.useSql
    ? 'sql'
    : undefined;
  if (!userDefinedDefaultEngine) {
    spinner.stopAndPersist();
    userDefinedDefaultEngine = await promptDefaultEngine();
  }
  const defaultEngineModule =
    userDefinedDefaultEngine == 'sql'
      ? sqlSampleModulePath
      : mongoSampleModulePath;
  spinner.start();
  fsExtra.copySync(defaultEngineModule, destinationPath, { overwrite: true });

  const project = new Project();
  project.addSourceFilesAtPaths(projectDir + '/**');
  const directory = project.getDirectoryOrThrow(
    `src/modules/${defaultEngine}/${name}`,
  );
  const sourceFiles = directory.getDescendantSourceFiles();
  const fileSystem = project.getFileSystem();

  const lcText = name;
  const ucText = lcText
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  const lcfucText = ucText.charAt(0).toLowerCase() + ucText.slice(1);
  for (const sourceFile of sourceFiles) {
    const srcFilePath = sourceFile.getFilePath();
    if (options.noSpec && sourceFile.getBaseName().includes('.spec')) {
      fileSystem.deleteSync(srcFilePath);
      continue;
    }
    let fullText = sourceFile
      .getFullText()
      .replace(/countryService/g, `${lcfucText}Service`)
      .replace(/country/g, lcText)
      .replace(/Country/g, ucText);
    if (defaultEngine !== userDefinedDefaultEngine) {
      fullText =
        defaultEngine === 'sql'
          ? fullText.replace(/mongo\/owner.decorator/, 'sql/owner.decorator')
          : fullText.replace(/sql\/owner.decorator/, 'mongo/owner.decorator');
    }
    fileSystem.writeFileSync(srcFilePath, fullText);
    fileSystem.moveSync(srcFilePath, srcFilePath.replace('country', name));
  }
  spinner.succeed(`${name} ${chalk.green('module created successfully!')}\n`);
  if (updateAppModule) {
    const appModulePath = projectDir + '/src/app.module.ts';
    const appModule = project.getSourceFileOrThrow(appModulePath);
    const classDeclaration = appModule.getClassOrThrow('AppModule');
    const decoration = classDeclaration?.getDecoratorOrThrow('Module');
    const obj: ObjectLiteralExpression =
      decoration.getArguments()[0] as ObjectLiteralExpression;

    const imports: ArrayLiteralExpression = obj
      .getPropertyOrThrow('imports')
      .getChildren()[2] as ArrayLiteralExpression;

    appModule.addImportDeclaration({
      moduleSpecifier: `./modules/${defaultEngine}/${name}/${name}.module`,
      namedImports: [`${ucText}Module`],
    });
    imports.addElement(`${ucText}Module`);
    project.saveSync();

    format(appModulePath);

    console.log(`${chalk.green('AppModule updated successfully!')}\n`);
  }
};
