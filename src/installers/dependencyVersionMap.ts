/*
 * This maps the necessary packages to a version.
 * This improves performance significantly over fetching it from the npm registry.
 */
export const dependencyVersionMap = {
  mysql2: '^3.1.2',
  sequelize: '^6.28.0',
  'sequelize-typescript': '^2.1.5',
  '@nestjs/sequelize': '^9.0.0',
  '@types/sequelize': '^4.28.14',
  '@nestjs-modules/mailer': '^1.8.1',
  nodemailer: '^6.9.1',
  '@types/nodemailer': '^6.4.7',
} as const;
export type AvailableDependencies = keyof typeof dependencyVersionMap;
