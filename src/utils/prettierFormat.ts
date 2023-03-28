import fsExtra from 'fs-extra';
import prettier from 'prettier';

export const format = (path: string) => {
  fsExtra.writeFileSync(
    path,
    prettier.format(fsExtra.readFileSync(path, 'utf8'), {
      parser: 'babel-ts',
    }),
  );
};
