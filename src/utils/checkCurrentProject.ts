import fs from 'fs-extra';
import path from 'path';
import { PackageJson } from 'type-fest';

export const isProjectInitWithCli = (opts: { projectDir: string }) => {
  const { projectDir } = opts;
  const filePath = path.join(projectDir, 'package.json');

  const pkgJson = fs.readJSONSync(filePath) as PackageJson & {
    sncMetadata: { initVersion: string };
  };

  console.log(pkgJson.sncMetadata?.initVersion);

  if (pkgJson.sncMetadata?.initVersion) return true;
  return false;
};
