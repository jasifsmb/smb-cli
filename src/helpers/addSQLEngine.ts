import chalk from "chalk";
import ora from "ora";
import { Project, SyntaxKind } from "ts-morph";
import { getSQLEngineChangeParams } from "~/utils/changeParams.js";
import { logger } from "~/utils/logger.js";
import { format } from "~/utils/prettierFormat.js";

export const addSQLEngine = ({ projectName }: { projectName: string }) => {
  // The project files are copied while installing packages for sql in installers/sql.ts

  logger.info("Adding SQL engine...");
  const spinner = ora(`Adding SQL engine...\n`).start();

  try {
    spinner.start();
    const projectDir = projectName;
    const project = new Project();
    project.addSourceFilesAtPaths(projectDir + "/**");

    const modulePath = projectDir + "/src/modules/common.module.ts";
    const gatewayPath = projectDir + "/src/app.gateway.ts";
    const jobFilePath = projectDir + "/src/core/core.job.ts";

    updateCommonModule(modulePath, project);
    updateAppGateway(gatewayPath, project);
    updateJobFile(jobFilePath, project);

    spinner.info(`Changing default app engine to ${chalk.cyan.bold("SQL")}\n`);
    changeDefaultEngine(projectDir + "/src/app.config.ts", project);

    project.saveSync();

    format(modulePath);
    format(gatewayPath);
    format(jobFilePath);
  } catch (error) {
    spinner.fail("Error occurred while adding sql engine files.");
    logger.error(error);
    process.exit(1);
  }
};

const updateCommonModule = (modulePath: string, project: Project) => {
  const commonModule = project.getSourceFileOrThrow(modulePath);
  const classDeclaration = commonModule.getClassOrThrow("CommonModule");
  const registerFunction = classDeclaration.getStaticMethodOrThrow("register");
  const modulesVariableDeclration =
    registerFunction.getVariableDeclarationOrThrow("modules");

  const variableDecleration = modulesVariableDeclration.getInitializerOrThrow(
    "modules variable declration not found!"
  );
  const changeParams = getSQLEngineChangeParams()["commonModule"];
  variableDecleration.replaceWithText(
    `[${changeParams.map((p) => p.name).toString()}]`
  );
  for (const param of changeParams) {
    commonModule.addImportDeclaration({
      moduleSpecifier: param.path,
      namedImports: [param.name],
    });
  }

  commonModule.fixUnusedIdentifiers();
};

const updateAppGateway = (gatewayPath: string, project: Project) => {
  const appGatewayClass = project.getSourceFileOrThrow(gatewayPath);
  const adapterFunction =
    appGatewayClass.getVariableDeclarationOrThrow("initAdapters");
  const declaration = adapterFunction
    .getParent()
    .getDescendantsOfKind(SyntaxKind.VariableDeclaration)
    .find((d) => d.getName() === "userService");

  if (!declaration) throw new Error("userService declaration not found");
  declaration.replaceWithText(
    "userService = app.select(UserModule).get(UserService)"
  );

  const changeParams = getSQLEngineChangeParams()["appGateway"];
  for (const param of changeParams) {
    appGatewayClass.addImportDeclaration({
      moduleSpecifier: param.path,
      namedImports: [param.name],
    });
  }

  appGatewayClass.fixUnusedIdentifiers();
};

const updateJobFile = (jobFilePath: string, project: Project) => {
  const jobFile = project.getSourceFileOrThrow(jobFilePath);
  const changeParams = getSQLEngineChangeParams()["job"];
  for (const param of changeParams) {
    jobFile.addImportDeclaration({
      moduleSpecifier: param.path,
      namedImports: [param.name],
    });
  }
  const SqlOptionsType = jobFile.addTypeAlias({
    name: "SqlOptions",
    type: `${changeParams
      .map((p) => p.name)
      .join(" & ")} & { pagination?: boolean;
      allowEmpty?: boolean;
      sideEffects?: boolean; }`,
  });
  const imports = jobFile.getImportDeclarations();
  const lastImport = imports[imports.length - 1];
  if (lastImport) {
    SqlOptionsType.setOrder(lastImport.getChildIndex() + 1);
    lastImport.appendWhitespace((writer) => writer.newLine());
  }

  const jobInterface = jobFile.getInterfaceOrThrow("Job");
  jobInterface.addProperty({
    name: "sql",
    type: "SqlOptions",
    hasQuestionToken: true,
  });
};

const changeDefaultEngine = (configPath: string, project: Project) => {
  const appConfig = project.getSourceFileOrThrow(configPath);
  const defaultEngineDeclaration =
    appConfig.getVariableDeclarationOrThrow("defaultEngine");
  const initializer = defaultEngineDeclaration.getInitializerOrThrow(
    "defaultEngine initiazer not found!"
  );
  initializer.replaceWithText("AppEngine.SQL");
};
