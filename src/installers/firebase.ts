import { type Installer } from '~/installers/index.js';
import { addPackageDependency } from '~/utils/addPackageDependency.js';

export const firebaseModuleInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: ['firebase-admin'],
    devMode: false,
  });

  addPackageDependency({
    projectDir,
    dependencies: [],
    devMode: true,
  });
};
