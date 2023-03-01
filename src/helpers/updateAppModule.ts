import prettier from "prettier";
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  Project,
} from "ts-morph";
import { PkgInstallerMap } from "~/installers/index.js";
import { getAppModuleUtils } from "~/utils/appModuleUtils.js";

export const updateAppModule = ({
  projectName,
  packages,
}: {
  projectName: string;
  packages: PkgInstallerMap;
}) => {
  const projectDir = projectName;
  const appModuleImports = getAppModuleUtils();
  // Object.keys()
  const project = new Project();
  project.addSourceFilesAtPaths(projectDir + "/**");
  project.getSourceFiles();

  const appModule = project.getSourceFileOrThrow(
    projectDir + "/src/app.module.ts"
  );
  appModule.addImportDeclaration({
    moduleSpecifier: "@core/sql",
    namedImports: ["SqlModule"],
  });
  const classDeclaration = appModule.getClassOrThrow("AppModule");
  const decoration = classDeclaration?.getDecoratorOrThrow("Module");
  const obj: ObjectLiteralExpression =
    decoration.getArguments()[0] as ObjectLiteralExpression;

  const imports: ArrayLiteralExpression = obj
    .getPropertyOrThrow("imports")
    .getChildren()[2] as ArrayLiteralExpression;
  imports.addElement("SqlModule.register({ seeder: true })");
  project.saveSync();
  const isFormatted = prettier.check(projectDir + "/src/app.module.ts", {
    parser: "typescript",
  });
  if (!isFormatted)
    prettier.format(projectDir + "/src/app.module.ts", {
      parser: "typescript",
      //   semi: false,
    });
  const isFormattedA = prettier.check(projectDir + "/src/app.module.ts", {
    parser: "typescript",
    // semi: false,
  });
  console.log({ isFormattedA });

  console.log("done");
};
