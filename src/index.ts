#!/usr/bin/env node
import { Command } from 'commander';
import { addCommand } from './actions/add.js';
import { moduleCommand } from './actions/module.js';
import { newCommand } from './actions/new.js';
import { SMB_NEST_CLI } from './consts.js';
import { availablePackages } from './installers/index.js';
import { getVersion } from './utils/getCliVersion.js';
import { logger } from './utils/logger.js';
import { renderTitle } from './utils/renderTitle.js';

renderTitle();

const program = new Command();
program
  .name(SMB_NEST_CLI)
  .description('A CLI for creating and managing SMB Nest Core App')
  .version(getVersion(), '-v, --version', 'Display the version number');

program
  .command('new')
  .description('Command for creating a new project')
  .alias('n')
  .argument(
    '[dir]',
    'The name of the application, as well as the name of the directory to create',
  )
  .option(
    '--noGit',
    'Explicitly tell the CLI to not initialize a new git repo in the project',
    false,
  )
  .option(
    '--noInstall',
    "Explicitly tell the CLI to not run the package manager's install command",
    false,
  )
  .action((arg, options) => {
    newCommand(arg, options).catch(handleError);
  });

program
  .command('add')
  .description('Command for add a third party module to the application')
  .alias('a')
  .argument('<module-name>', 'Name of the third party module')
  .option(
    '--noInstall',
    "Explicitly tell the CLI to not run the package manager's install command",
    false,
  )
  .addHelpText(
    'before',
    `Supported modules: ${availablePackages
      .filter((pkg) => pkg !== 'sql')
      .join(', ')}`,
  )
  .action((arg, options) => {
    addCommand(arg, options).catch(handleError);
  });

program
  .command('module')
  .argument(
    '<name>',
    'Name of the module to be created. (Hyphen seperated lowercase words)',
  )
  .alias('m')
  .option(
    '--noSpec',
    "Explicitly tell the CLI to not add test files.",
    false,
  )
  .description('Generate a new module')
  .addHelpText('before', 'Eg: payment, order-checkout')
  .action((arg, options) => {
    moduleCommand(arg, options).catch(handleError);
  });

function handleError(err: any) {
  logger.error('Aborting...');
  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error(
      'An unknown error has occurred. Please open an issue on github with the below:',
    );
    console.log(err);
  }
  process.exit(1);
}

program.parse();
