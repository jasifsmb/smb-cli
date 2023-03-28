#!/usr/bin/env node
import { Command } from 'commander';
import { newCommand } from './actions/new.js';
import { SMB_NEST_CLI } from './consts.js';
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
  .description('A CLI for creating SMB Nest Core App')
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
  .action((str, options) => {
    newCommand(str, options).catch(handleError);
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
