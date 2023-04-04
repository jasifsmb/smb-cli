import fsExtra from 'fs-extra';
import path from 'path';
import { PkgInstallerMap } from '~/installers/index.js';

export function resolveModulePaths(
  packages: PkgInstallerMap,
  projectDir: string,
) {
  const pkgJson = fsExtra.readJSONSync(path.join(projectDir, 'package.json'));
  const tsConfig = fsExtra.readJSONSync(path.join(projectDir, 'tsconfig.json'));
  const nestCliConfig = fsExtra.readJSONSync(
    path.join(projectDir, 'nest-cli.json'),
  );
  const jestConfig = fsExtra.readJSONSync(
    path.join(projectDir, 'test/jest-e2e.json'),
  );
  let moduleNameMapper = {};
  let tsConfigPaths = {};
  let nestCliPaths = {};
  for (const [name, pkgOpts] of Object.entries(packages)) {
    if (pkgOpts.inUse && name !== 'sql') {
      moduleNameMapper = {
        ...moduleNameMapper,
        [`^@core/${name}(|/.*)$`]: `<rootDir>/libs/${name}/src/$1`,
      };
      tsConfigPaths = {
        ...tsConfigPaths,
        [`@core/${name}`]: [`libs/${name}/src`],
        [`@core/${name}/*`]: [`libs/${name}/src/*`],
      };
      nestCliPaths = {
        ...nestCliPaths,
        [name]: {
          type: 'library',
          root: `libs/${name}`,
          entryFile: 'index',
          sourceRoot: `libs/${name}/src`,
          compilerOptions: {
            tsConfigPath: `libs/${name}/tsconfig.lib.json`,
          },
        },
      };
    }
  }
  pkgJson.jest.moduleNameMapper = {
    ...pkgJson.jest.moduleNameMapper,
    ...moduleNameMapper,
  };
  tsConfig.compilerOptions.paths = {
    ...tsConfig.compilerOptions.paths,
    ...tsConfigPaths,
  };
  jestConfig.moduleNameMapper = {
    ...jestConfig.moduleNameMapper,
    ...moduleNameMapper,
  };
  nestCliConfig.projects = {
    ...nestCliConfig.projects,
    ...nestCliPaths,
  };
  fsExtra.writeJSONSync(path.join(projectDir, 'package.json'), pkgJson, {
    spaces: 2,
  });
  fsExtra.writeJSONSync(path.join(projectDir, 'tsconfig.json'), tsConfig, {
    spaces: 2,
  });
  fsExtra.writeJSONSync(path.join(projectDir, 'nest-cli.json'), nestCliConfig, {
    spaces: 2,
  });
  fsExtra.writeJSONSync(
    path.join(projectDir, 'test/jest-e2e.json'),
    jestConfig,
    {
      spaces: 2,
    },
  );
}
