import path from 'path';
import { Project } from 'ts-morph';
import { PKG_ROOT } from '~/consts.js';
import { getDefaultEngine } from '~/helpers/getDefaultEngine.js';
import { isProjectInitWithCli } from '~/utils/checkCurrentProject.js';
import { logger } from '~/utils/logger.js';

interface ModuleCommandFlags {
  noSpec: boolean;
  engine: 'SQL' | 'Mongo'
}

export const moduleCommand = async (
  name: string,
  options: ModuleCommandFlags,
) => {
  const projectDir = process.cwd();
  if (!isProjectInitWithCli({ projectDir })) {
    logger.error(`Error: looks like you are not running the command from the root.
Please run the command inside the root folder of the project.`);
    process.exit(1);
  }

  const defaultEngine = getDefaultEngine({ projectDir });
  const sqlSampleModulePath = path.join(PKG_ROOT, 'template/extras/modules/sql/country');
  const mongoSampleModulePath = path.join(PKG_ROOT, 'template/extras/modules/mongo/country');
  const defaultEngineModule = defaultEngine == 'SQL' ? sqlSampleModulePath : mongoSampleModulePath;



  const project = new Project();
  project.addSourceFilesAtPaths(projectDir + '/**');

};
