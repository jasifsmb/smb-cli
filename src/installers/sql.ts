import fs from "fs-extra";
import path from "path";
import { PKG_ROOT } from "~/consts.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { type Installer } from "~/installers/index.js";

export const sqlInstaller: Installer = ({ projectDir }) => {
  addPackageDependency({
    projectDir,
    dependencies: [
      "mysql2",
      "sequelize",
      "sequelize-typescript",
      "@nestjs/sequelize",
    ],
    devMode: false,
  });

  addPackageDependency({
    projectDir,
    dependencies: ["@types/sequelize"],
    devMode: true,
  });

  const libsDir = path.join(PKG_ROOT, "template/extras/libs/sql");
  const decDir = path.join(PKG_ROOT, "template/extras/decorators/sql");
  const modDir = path.join(PKG_ROOT, "template/extras/modules/sql");

  const sqlLibsDest = path.join(projectDir, "libs/sql");
  const sqlDecDest = path.join(projectDir, "src/core/decprators/sql");
  const sqlModDest = path.join(projectDir, "src/modules/sql");

  fs.copySync(libsDir, sqlLibsDest, { overwrite: true });
  fs.copySync(decDir, sqlDecDest, { overwrite: true });
  fs.copySync(modDir, sqlModDest, { overwrite: true });
};
