import { type Installer } from '~/installers/index.js';
import { addPackageDependency } from '~/utils/addPackageDependency.js';

export const twilioModuleInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: ['twilio'],
    devMode: false,
  });

  addPackageDependency({
    projectDir,
    dependencies: [],
    devMode: true,
  });
};
