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

  const extrasDir = path.join(PKG_ROOT, "template/extras");

  const sqlDir = path.join(extrasDir, "sql");
  const sqlDest = path.join(projectDir, "libs/sql");

  fs.copySync(sqlDir, sqlDest, { overwrite: true });
};
