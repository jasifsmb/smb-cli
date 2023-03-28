import { type PkgInstallerMap } from '~/installers/index.js';
import path from 'path';
import { installPackages } from '~/helpers/installPackages.js';
import { scaffoldProject } from '~/helpers/scaffoldProject.js';
import { getUserPkgManager } from '~/utils/getUserPkgManager.js';
import { updateAppModule } from './updateAppModule.js';
import { addSQLEngine } from './addSQLEngine.js';
import { addMongoEngine } from './addMongoEngine.js';
import { copyLibModules } from './copyLibModules.js';
import { resolveModulePaths } from './resolveModulePaths.js';

interface CreateProjectOptions {
  projectName: string;
  packages: PkgInstallerMap;
  noInstall: boolean;
}

export const createProject = async ({
  projectName,
  packages,
  noInstall,
}: CreateProjectOptions) => {
  const pkgManager = getUserPkgManager();
  const projectDir = path.resolve(process.cwd(), projectName);

  // Bootstraps the base Nest.js application
  await scaffoldProject({
    projectName,
    projectDir,
    pkgManager,
    noInstall,
  });

  // Install the selected packages
  installPackages({
    projectDir,
    pkgManager,
    packages,
    noInstall,
  });

  if (packages.sql.inUse) {
    addSQLEngine({ projectName });
  } else {
    addMongoEngine({ projectName });
  }

  copyLibModules(packages, projectDir);
  resolveModulePaths(packages, projectDir);

  updateAppModule({ projectName, packages });

  return projectDir;
};
