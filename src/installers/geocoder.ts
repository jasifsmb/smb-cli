import { type Installer } from '~/installers/index.js';
import { addPackageDependency } from '~/utils/addPackageDependency.js';

export const geocoderModuleInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: ['node-geocoder'],
    devMode: false,
  });

  addPackageDependency({
    projectDir,
    dependencies: [],
    devMode: true,
  });
};
