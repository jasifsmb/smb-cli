import { type Installer } from '~/installers/index.js';
import { addPackageDependency } from '~/utils/addPackageDependency.js';

export const emailModuleInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: ['@nestjs-modules/mailer', 'nodemailer'],
    devMode: false,
  });

  addPackageDependency({
    projectDir,
    dependencies: ['@types/nodemailer'],
    devMode: true,
  });
};
