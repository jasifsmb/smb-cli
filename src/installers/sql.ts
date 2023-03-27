import { type Installer } from '~/installers/index.js';
import { addPackageDependency } from '~/utils/addPackageDependency.js';

export const sqlInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: [
      'mysql2',
      'sequelize',
      'sequelize-typescript',
      '@nestjs/sequelize',
    ],
    devMode: false,
  });

  addPackageDependency({
    projectDir,
    dependencies: ['@types/sequelize'],
    devMode: true,
  });
};
