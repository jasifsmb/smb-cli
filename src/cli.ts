import chalk from "chalk";
import * as commander from "commander";
import inquirer from "inquirer";
import { DEFAULT_APP_NAME, SMB_NEST_CLI } from "./consts.js";
import { availablePackages, AvailablePackages } from "./installers/index.js";
import { getVersion } from "./utils/getCliVersion.js";
import { getUserPkgManager } from "./utils/getUserPkgManager.js";
import { logger } from "./utils/logger.js";
import { validateAppName } from "./utils/validateAppName.js";

interface CliFlags {
  noGit: boolean;
  noInstall: boolean;
  default: boolean;
  importAlias: string;
}

interface CliResults {
  appName: string;
  packages: AvailablePackages[];
  flags: CliFlags;
}

const defaultOptions: CliResults = {
  appName: DEFAULT_APP_NAME,
  packages: [],
  flags: {
    noGit: false,
    noInstall: false,
    default: false,
    importAlias: "~/",
  },
};

export const runCli = async () => {
  const cliResults = defaultOptions;
  const supportedCommands = ["new", "add"];
  const program = new commander.Command().name(SMB_NEST_CLI);

  program
    .description("A CLI for creating SMB Nest Core App")
    .addArgument(
      new commander.Argument("[command]", "CLI command to take action").choices(
        supportedCommands
      )
    )
    .argument(
      "[dir]",
      "The name of the application, as well as the name of the directory to create"
    )
    .option(
      "--noGit",
      "Explicitly tell the CLI to not initialize a new git repo in the project",
      false
    )
    .option(
      "--noInstall",
      "Explicitly tell the CLI to not run the package manager's install command",
      false
    )
    .option(
      "-y, --default",
      "Bypass the CLI and use all default options to bootstrap a new SMB Nest Core App",
      false
    )
    .version(getVersion(), "-v, --version", "Display the version number")
    .parse(process.argv);

  // FIXME: TEMPORARY WARNING WHEN USING YARN 3.
  if (process.env.npm_config_user_agent?.startsWith("yarn/3")) {
    logger.warn(`  WARNING: It looks like you are using Yarn 3. This is currently not supported,
    and likely to result in a crash. Please run smb-nest-cli with another
    package manager such as pnpm, npm, or Yarn Classic.`);
  }

  const command = program.args[0];
  if (command !== "new") {
    logger.error(`Command ${chalk.cyan.bold(command)} not implemented yet!`);
    process.exit(0);
  }

  const cliProvidedName = program.args[1];
  if (cliProvidedName) {
    cliResults.appName = cliProvidedName;
  }
  cliResults.flags = program.opts();

  try {
    if (
      process.env.SHELL?.toLowerCase().includes("git") &&
      process.env.SHELL?.includes("bash")
    ) {
      logger.warn(`  WARNING: It looks like you are using Git Bash which is non-interactive. Please run smb-nest-cli with another
    terminal such as Windows Terminal or PowerShell if you want to use the interactive CLI.`);

      const error = new Error("Non-interactive environment");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).isTTYError = true;
      throw error;
    }

    if (!cliProvidedName) {
      cliResults.appName = await promptAppName();
    }
    // cliResults.packages = await promptPackages();

    const defaultEngine = await promptDefaultEngine();
    if (defaultEngine === "sql") {
      cliResults.packages.push("sql");
    }

    if (!cliResults.flags.noGit) {
      cliResults.flags.noGit = !(await promptGit());
    }

    if (!cliResults.flags.noInstall) {
      cliResults.flags.noInstall = !(await promptInstall());
    }

    return cliResults;
  } catch (error) {
    if (error instanceof Error && (error as any).isTTYError) {
      logger.warn(`
  ${SMB_NEST_CLI} needs an interactive terminal to provide options`);

      const { shouldContinue } = await inquirer.prompt<{
        shouldContinue: boolean;
      }>({
        name: "shouldContinue",
        type: "confirm",
        message: `Continue scaffolding a default SMB Nest CLI app?`,
        default: true,
      });

      if (!shouldContinue) {
        logger.info("Exiting...");
        process.exit(0);
      }

      logger.info(
        `Bootstrapping a default SMB Nest Core App in ./${cliResults.appName}`
      );
    } else {
      throw error;
    }

    return cliResults;
  }
};

const promptAppName = async (): Promise<string> => {
  const { appName } = await inquirer.prompt<Pick<CliResults, "appName">>({
    name: "appName",
    type: "input",
    message: "What will your project be called?",
    default: defaultOptions.appName,
    validate: validateAppName,
    transformer: (input: string) => {
      return input.trim();
    },
  });

  return appName;
};

const promptPackages = async (): Promise<AvailablePackages[]> => {
  const { packages } = await inquirer.prompt<Pick<CliResults, "packages">>({
    name: "packages",
    type: "checkbox",
    message: "Which packages would you like to enable?",
    choices: availablePackages
      .filter((p) => p !== "sql")
      .map((pkgName) => ({
        name: pkgName,
        checked: false,
      })),
  });

  return packages;
};

const promptDefaultEngine = async (): Promise<"sql" | "mongo"> => {
  const { defaultEngine } = await inquirer.prompt<{
    defaultEngine: "sql" | "mongo";
  }>({
    name: "defaultEngine",
    type: "list",
    message: "Choose the default database engnie",
    choices: [
      {
        key: "m",
        name: "Mongo",
        value: "mongo",
      },
      {
        key: "s",
        name: "SQL",
        value: "sql",
      },
    ],
  });

  return defaultEngine;
};

const promptGit = async (): Promise<boolean> => {
  const { git } = await inquirer.prompt<{ git: boolean }>({
    name: "git",
    type: "confirm",
    message: "Initialize a new git repository?",
    default: true,
  });

  if (git) {
    logger.success("Nice one! Initializing repository!");
  } else {
    logger.info("Sounds good! You can come back and run git init later.");
  }

  return git;
};

const promptInstall = async (): Promise<boolean> => {
  const pkgManager = getUserPkgManager();

  const { install } = await inquirer.prompt<{ install: boolean }>({
    name: "install",
    type: "confirm",
    message:
      `Would you like us to run '${pkgManager}` +
      (pkgManager === "yarn" ? `'?` : ` install'?`),
    default: true,
  });

  if (install) {
    logger.success("Alright. We'll install the dependencies for you!");
  } else {
    if (pkgManager === "yarn") {
      logger.info(
        `No worries. You can run '${pkgManager}' later to install the dependencies.`
      );
    } else {
      logger.info(
        `No worries. You can run '${pkgManager} install' later to install the dependencies.`
      );
    }
  }

  return install;
};
