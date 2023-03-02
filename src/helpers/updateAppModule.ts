import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import prettier from "prettier";
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  Project,
} from "ts-morph";
import { AvailablePackages, PkgInstallerMap } from "~/installers/index.js";
import { getAppModuleChangeParams } from "~/utils/appModuleUtils.js";
import { logger } from "~/utils/logger.js";

export const updateAppModule = ({
  projectName,
  packages,
}: {
  projectName: string;
  packages: PkgInstallerMap;
}) => {
  logger.info("Updating AppModule file...");
  const spinner = ora(`Updating AppModule file...\n`).start();
  try {
    spinner.start();
    const projectDir = projectName;
    const appModulePath = projectDir + "/src/app.module.ts";
    const appModuleChangeParams = getAppModuleChangeParams();
    const project = new Project();
    project.addSourceFilesAtPaths(projectDir + "/**");
    project.getSourceFiles();

    const appModule = project.getSourceFileOrThrow(appModulePath);
    const classDeclaration = appModule.getClassOrThrow("AppModule");
    const decoration = classDeclaration?.getDecoratorOrThrow("Module");
    const obj: ObjectLiteralExpression =
      decoration.getArguments()[0] as ObjectLiteralExpression;

    const imports: ArrayLiteralExpression = obj
      .getPropertyOrThrow("imports")
      .getChildren()[2] as ArrayLiteralExpression;
    const isInUsePackages = Object.entries(packages).filter(
      (pkg) => pkg[1].inUse
    );

    for (const pkg of isInUsePackages) {
      const pkgName = pkg[0] as AvailablePackages;
      if (appModuleChangeParams[pkgName]) {
        spinner.info(
          `Updating AppModule file for ${chalk.cyan.bold(pkgName)} module...\n`
        );
        appModule.addImportDeclaration({
          moduleSpecifier: appModuleChangeParams[pkgName].moduleSpecifier,
          namedImports: appModuleChangeParams[pkgName].namedImports,
        });
        imports.addElement(appModuleChangeParams[pkgName].importElement);
      } else {
        logger.warn(
          `Change parameters not found for ${chalk.cyan.bold(pkgName)} module!`
        );
      }
    }

    project.saveSync();

    // formatting appModule.ts using prettier
    fs.writeFileSync(
      appModulePath,
      prettier.format(fs.readFileSync(appModulePath, "utf8"), {
        parser: "babel-ts",
      })
    );

    spinner.succeed(`${chalk.green("AppModule updated successfully!")}\n`);
  } catch (error) {
    spinner.fail("Error occurred while updating AppModule File.");
    logger.error(error);
    process.exit(1);
  }
};
