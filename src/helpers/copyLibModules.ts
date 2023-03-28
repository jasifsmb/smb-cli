import fsExtra from 'fs-extra';
import path from 'path';
import { PKG_ROOT } from '~/consts.js';
import { AvailablePackages } from '~/installers/index.js';

export function copyLibModules(
  packages: AvailablePackages[],
  projectDir: string,
) {
  packages
    .filter((p) => p !== 'sql')
    .forEach((pkg) => {
      const src = path.join(PKG_ROOT, `template/extras/libs/${pkg}`);
      const dest = path.join(projectDir, `src/libs/${pkg}`);
      fsExtra.copySync(src, dest, { overwrite: true });
    });
}
