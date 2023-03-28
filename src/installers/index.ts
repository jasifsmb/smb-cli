import { type PackageManager } from '~/utils/getUserPkgManager.js';
import { emailModuleInstaller } from './email.js';
import { sqlInstaller } from './sql.js';

export const availablePackages = ['sql', 'email'] as const;
export type AvailablePackages = (typeof availablePackages)[number];

export interface InstallerOptions {
  projectDir: string;
  pkgManager: PackageManager;
  noInstall: boolean;
  packages?: PkgInstallerMap;
  projectName?: string;
}

export type Installer = (opts: InstallerOptions) => void;

export type PkgInstallerMap = {
  [pkg in AvailablePackages]: {
    inUse: boolean;
    installer: Installer;
  };
};

export const buildPkgInstallerMap = (
  packages: AvailablePackages[],
): PkgInstallerMap => ({
  sql: {
    inUse: packages.includes('sql'),
    installer: sqlInstaller,
  },
  email: {
    inUse: packages.includes('email'),
    installer: emailModuleInstaller,
  },
});
