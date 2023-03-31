import { type Installer } from '~/installers/index.js';
import { addPackageDependency } from '~/utils/addPackageDependency.js';

export const stripeModuleInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: ['stripe'],
    devMode: false,
  });

  addPackageDependency({
    projectDir,
    dependencies: ['@types/nodemailer'],
    devMode: true,
  });
};
