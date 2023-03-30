import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { PackageJson } from 'type-fest';
import { SMB_NEST_CLI } from '~/consts.js';
import { createProject } from '~/helpers/createProject.js';
import { promptDefaultEngine } from '~/helpers/getDefaultEngine.js';
import { initializeGit } from '~/helpers/git.js';
import {
  installDependencies,
  promptInstall,
} from '~/helpers/installDependencies.js';
import { logNextSteps } from '~/helpers/logNextSteps.js';
import {
  availablePackages,
  AvailablePackages,
  buildPkgInstallerMap,
} from '~/installers/index.js';
import { getVersion } from '~/utils/getCliVersion.js';
import { logger } from '~/utils/logger.js';
import { parseNameAndPath } from '~/utils/parseNameAndPath.js';
import { validateAppName } from '~/utils/validateAppName.js';

interface NewCommandFlags {
  noGit: boolean;
  noInstall: boolean;
  default: boolean;
}

interface CliResults {
  packages: AvailablePackages[];
  flags: NewCommandFlags;
}

export type SNCPackageJSON = PackageJson & {
  sncMetadata?: {
    initVersion: string;
  };
};

const defaultOptions: CliResults = {
  packages: [],
  flags: {
    noGit: false,
    noInstall: false,
    default: false,
  },
};

export const newCommand = async (appName: string, options: NewCommandFlags) => {
  const cliResults = defaultOptions;
  const cliProvidedName = appName;
  if (cliProvidedName) {
    appName = cliProvidedName;
  }
  cliResults.flags = options;

  try {
    if (
      process.env.SHELL?.toLowerCase().includes('git') &&
      process.env.SHELL?.includes('bash')
    ) {
      logger.warn(`  WARNING: It looks like you are using Git Bash which is non-interactive. Please run smb-nest-cli with another
    terminal such as Windows Terminal or PowerShell if you want to use the interactive CLI.`);

      const error = new Error('Non-interactive environment');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).isTTYError = true;
      throw error;
    }

    if (!cliProvidedName) {
      appName = await promptAppName(appName);
    }
    cliResults.packages = await promptPackages();

    const defaultEngine = await promptDefaultEngine();
    if (defaultEngine === 'sql') {
      cliResults.packages.push('sql');
    }

    if (!cliResults.flags.noGit) {
      cliResults.flags.noGit = !(await promptGit());
    }

    if (!cliResults.flags.noInstall) {
      cliResults.flags.noInstall = !(await promptInstall());
    }
  } catch (error) {
    if (error instanceof Error && (error as any).isTTYError) {
      logger.warn(`
  ${SMB_NEST_CLI} needs an interactive terminal to provide options`);

      const { shouldContinue } = await inquirer.prompt<{
        shouldContinue: boolean;
      }>({
        name: 'shouldContinue',
        type: 'confirm',
        message: `Continue scaffolding a default SMB Nest CLI app?`,
        default: true,
      });

      if (!shouldContinue) {
        logger.info('Exiting...');
        process.exit(0);
      }

      logger.info(`Bootstrapping a default SMB Nest Core App in ./${appName}`);
    } else {
      throw error;
    }
  }

  const {
    packages,
    flags: { noGit, noInstall },
  } = cliResults;

  const usePackages = buildPkgInstallerMap(packages);
  const [scopedAppName, appDir] = parseNameAndPath(appName);

  const projectDir = await createProject({
    projectName: appDir,
    packages: usePackages,
    noInstall,
  });

  const pkgJson = fs.readJSONSync(
    path.join(projectDir, 'package.json'),
  ) as SNCPackageJSON;
  pkgJson.name = scopedAppName;
  pkgJson.sncMetadata = { initVersion: getVersion() };
  fs.writeJSONSync(path.join(projectDir, 'package.json'), pkgJson, {
    spaces: 2,
  });

  if (!noInstall) {
    await installDependencies({ projectDir });
  }

  if (!noGit) {
    await initializeGit(projectDir);
  }

  logNextSteps({ projectName: appDir, packages: usePackages, noInstall });

  process.exit(0);
};

const promptAppName = async (defaultName: string): Promise<string> => {
  const { appName } = await inquirer.prompt<{ appName: string }>({
    name: 'appName',
    type: 'input',
    message: 'What will your project be called?',
    default: defaultName,
    validate: validateAppName,
    transformer: (input: string) => {
      return input.trim();
    },
  });

  return appName;
};

const promptPackages = async (): Promise<AvailablePackages[]> => {
  const { packages } = await inquirer.prompt<Pick<CliResults, 'packages'>>({
    name: 'packages',
    type: 'checkbox',
    message: 'Which packages would you like to enable?',
    choices: availablePackages
      .filter((p) => p !== 'sql')
      .map((pkgName) => ({
        name: pkgName,
        checked: false,
      })),
  });

  return packages;
};

const promptGit = async (): Promise<boolean> => {
  const { git } = await inquirer.prompt<{ git: boolean }>({
    name: 'git',
    type: 'confirm',
    message: 'Initialize a new git repository?',
    default: true,
  });

  if (git) {
    logger.success('Nice one! Initializing repository!');
  } else {
    logger.info('Sounds good! You can come back and run git init later.');
  }

  return git;
};
