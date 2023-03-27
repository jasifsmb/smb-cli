import path from 'path';
import { fileURLToPath } from 'url';

// With the move to TSUP as a build tool, this keeps path routes in other files (installers, loaders, etc) in check more easily.
// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, '../');

export const TITLE_TEXT = `                                                                                                                           
                                                                                                                           
 .M"""bgd \`7MMM.     ,MMF'\`7MM"""Yp,     \`7MN.   \`7MF'\`7MM"""YMM   .M"""bgd MMP""MM""YMM       .g8"""bgd \`7MMF'      \`7MMF'
,MI    "Y   MMMb    dPMM    MM    Yb       MMN.    M    MM    \`7  ,MI    "Y P'   MM   \`7     .dP'     \`M   MM          MM  
\`MMb.       M YM   ,M MM    MM    dP       M YMb   M    MM   d    \`MMb.          MM          dM'       \`   MM          MM  
  \`YMMNq.   M  Mb  M' MM    MM"""bg.       M  \`MN. M    MMmmMM      \`YMMNq.      MM          MM            MM          MM  
.     \`MM   M  YM.P'  MM    MM    \`Y       M   \`MM.M    MM   Y  , .     \`MM      MM          MM.           MM      ,   MM  
Mb     dM   M  \`YM'   MM    MM    ,9       M     YMM    MM     ,M Mb     dM      MM          \`Mb.     ,'   MM     ,M   MM  
P"Ybmmd"  .JML. \`'  .JMML..JMMmmmd9      .JML.    YM  .JMMmmmmMMM P"Ybmmd"     .JMML.          \`"bmmmd'  .JMMmmmmMMM .JMML.
                                                                                                                          
                                                                                                                          
`;
export const DEFAULT_APP_NAME = 'smb-nest-app';
export const SMB_NEST_CLI = 'smb-nest-cli';
