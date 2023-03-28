import fsExtra from 'fs-extra';
import path from 'path';
import { PkgInstallerMap } from '~/installers/index.js';

export function resolveModulePaths(
  packages: PkgInstallerMap,
  projectDir: string,
) {
  for (const [name, pkgOpts] of Object.entries(packages)) {
    if (pkgOpts.inUse && name !== 'sql') {
      const pkgJson = fsExtra.readJSONSync(
        path.join(projectDir, 'package.json'),
      );
      pkgJson.jest.moduleNameMapper = {
        ...pkgJson.jest.moduleNameMapper,
        [`^@core/${name}(|/.*)$`]: `<rootDir>/libs/${name}/src/$1`,
      };
      fsExtra.writeJSONSync(path.join(projectDir, 'package.json'), pkgJson, {
        spaces: 2,
      });
      const tsConfig = fsExtra.readJSONSync(
        path.join(projectDir, 'tsconfig.json'),
      );
      tsConfig.compilerOptions.paths = {
        ...tsConfig.compilerOptions.paths,
        [`@core/${name}`]: [`libs/${name}/src`],
        [`@core/${name}/*`]: [`libs/${name}/src/*`],
      };
      fsExtra.writeJSONSync(path.join(projectDir, 'tsconfig.json'), tsConfig, {
        spaces: 2,
      });
    }
  }
}
