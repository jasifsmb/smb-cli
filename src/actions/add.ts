import { AvailablePackages, buildPkgInstallerMap } from '~/installers/index.js';
import { isProjectInitWithCli } from '~/utils/checkCurrentProject.js';
import { getUserPkgManager } from '~/utils/getUserPkgManager.js';
import { logger } from '~/utils/logger.js';
import { installPackages } from '~/helpers/installPackages.js';
import { copyLibModules } from '~/helpers/copyLibModules.js';
import { resolveModulePaths } from '~/helpers/resolveModulePaths.js';
import { updateAppModule } from '~/helpers/updateAppModule.js';
import {
  installDependencies,
  promptInstall,
} from '~/helpers/installDependencies.js';

interface AddCommandFlags {
  noInstall: boolean;
}

export const addCommand = async (
  module: AvailablePackages,
  options: AddCommandFlags,
) => {
  const projectDir = process.cwd();
  const pkgManager = getUserPkgManager();
  if (!isProjectInitWithCli({ projectDir })) {
    logger.error(`Error: looks like you are not running the command from the root.
Please run the command inside the root folder of the project.`);
    process.exit(1);
  }
  if (!options.noInstall) {
    options.noInstall = !(await promptInstall());
  }

  const packages = buildPkgInstallerMap([module]);
  installPackages({
    projectDir,
    pkgManager,
    packages,
    noInstall: options.noInstall,
  });

  copyLibModules(packages, projectDir);
  resolveModulePaths(packages, projectDir);
  updateAppModule({ projectName: projectDir, packages });

  if (!options.noInstall) {
    await installDependencies({ projectDir });
  }
};
