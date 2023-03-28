import { type Installer } from '~/installers/index.js';
import { addPackageDependency } from '~/utils/addPackageDependency.js';

export const recaptchaModuleInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: [],
    devMode: false,
  });

  addPackageDependency({
    projectDir,
    dependencies: [],
    devMode: true,
  });
};
