import { type PkgInstallerMap } from "~/installers/index.js";
import path from "path";
import { installPackages } from "~/helpers/installPackages.js";
import { scaffoldProject } from "~/helpers/scaffoldProject.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { updateAppModule } from "./updateAppModule.js";

interface CreateProjectOptions {
  projectName: string;
  packages: PkgInstallerMap;
  noInstall: boolean;
  importAlias: string;
  defaultEngine: "sql" | "mongo";
}

export const createProject = async ({
  projectName,
  packages,
  noInstall,
  defaultEngine,
}: CreateProjectOptions) => {
  const pkgManager = getUserPkgManager();
  const projectDir = path.resolve(process.cwd(), projectName);

  // Bootstraps the base Next.js application
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

  updateAppModule({ projectName, packages, defaultEngine });

  return projectDir;
};
