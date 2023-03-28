import fsExtra from 'fs-extra';
import path from 'path';
import { PKG_ROOT } from '~/consts.js';
import { PkgInstallerMap } from '~/installers/index.js';

export function copyLibModules(packages: PkgInstallerMap, projectDir: string) {
  for (const [name, pkgOpts] of Object.entries(packages)) {
    if (pkgOpts.inUse && name !== 'sql') {
      const src = path.join(PKG_ROOT, `template/extras/libs/${name}`);
      const dest = path.join(projectDir, `src/libs/${name}`);
      fsExtra.copySync(src, dest, { overwrite: true });
    }
  }
}
