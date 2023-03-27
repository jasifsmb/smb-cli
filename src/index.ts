#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { PackageJson } from 'type-fest';
import { runCli } from './cli.js';
import { createProject } from './helpers/createProject.js';
import { initializeGit } from './helpers/git.js';
import { installDependencies } from './helpers/installDependencies.js';
import { logNextSteps } from './helpers/logNextSteps.js';
import { buildPkgInstallerMap } from './installers/index.js';
import { getVersion } from './utils/getCliVersion.js';
import { logger } from './utils/logger.js';
import { parseNameAndPath } from './utils/parseNameAndPath.js';
import { renderTitle } from './utils/renderTitle.js';

type SNCPackageJSON = PackageJson & {
  sncMetadata?: {
    initVersion: string;
  };
};

const main = async () => {
  renderTitle();
  const {
    appName,
    packages,
    flags: { noGit, noInstall, importAlias },
  } = await runCli();

  const usePackages = buildPkgInstallerMap(packages);
  const [scopedAppName, appDir] = parseNameAndPath(appName);

  const projectDir = await createProject({
    projectName: appDir,
    packages: usePackages,
    importAlias: importAlias,
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

main().catch((err) => {
  logger.error('Aborting installation...');
  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error(
      'An unknown error has occurred. Please open an issue on github with the below:',
    );
    console.log(err);
  }
  process.exit(1);
});
