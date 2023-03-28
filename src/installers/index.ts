import { type PackageManager } from '~/utils/getUserPkgManager.js';
import { emailModuleInstaller } from './email.js';
import { firebaseModuleInstaller } from './firebase.js';
import { geocoderModuleInstaller } from './geocoder.js';
import { recaptchaModuleInstaller } from './recaptcha.js';
import { sqlInstaller } from './sql.js';
import { twilioModuleInstaller } from './twilio.js';

export const availablePackages = [
  'sql',
  'email',
  'recaptcha',
  'twilio',
  'geocoder',
  'firebase',
] as const;
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
  recaptcha: {
    inUse: packages.includes('recaptcha'),
    installer: recaptchaModuleInstaller,
  },
  twilio: {
    inUse: packages.includes('twilio'),
    installer: twilioModuleInstaller,
  },
  geocoder: {
    inUse: packages.includes('geocoder'),
    installer: geocoderModuleInstaller,
  },
  firebase: {
    inUse: packages.includes('firebase'),
    installer: firebaseModuleInstaller,
  },
});
