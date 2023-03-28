import { Schema } from 'mongoose';
import { DeletedMethods } from '../methods';
import { DeletedStaticMethods } from '../statics';
import Deleted from './Deleted';
import { DeletedQueryHelpers } from './DeletedQuery';

type DeletedSchema<T extends Deleted = Deleted> = Schema<
  T,
  any,
  DeletedMethods,
  DeletedQueryHelpers<any, any>,
  any,
  DeletedStaticMethods<any, any>,
  any,
  any
>;

export default DeletedSchema;
