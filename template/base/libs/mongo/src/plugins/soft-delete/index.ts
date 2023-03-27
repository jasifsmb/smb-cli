import { default as deletedPlugin } from './plugin';

export { DeletedByMethods, DeletedMethods } from './methods';
export { DeletedByStaticMethods, DeletedStaticMethods } from './statics';
export { default as Deleted } from './types/Deleted';
export { default as DeletedAt } from './types/DeletedAt';
export { default as DeletedBy } from './types/DeletedBy';
export {
  default as DeletedDocument,
  DeletedAtDocument,
  DeletedByDocument,
} from './types/DeletedDocument';
export {
  default as DeletedQuery,
  DeletedQueryHelpers,
} from './types/DeletedQuery';
export { default as DeletedSchema } from './types/DeletedSchema';
export { DeleteOptions } from './types/DeleteOptions';

export default deletedPlugin;
