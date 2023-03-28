import { UpdateQuery } from 'mongoose';
import Deleted from '../types/Deleted';
import DeletedFieldOptions from '../types/DeletedFieldOptions';
import deletedProp from './deleteProp';

export default function deleteDocument<TUser>(
  { deletedAt, deletedBy }: DeletedFieldOptions,
  user?: TUser,
): Record<string, unknown> {
  return {
    deleted: true,
    ...deletedProp(deletedAt, new Date()),
    ...(user && deletedProp(deletedBy, user)),
  };
}

export function staticDelete<TUser>(
  deletedFieldOptions: DeletedFieldOptions,
  user?: TUser,
): UpdateQuery<Deleted> {
  return {
    $set: deleteDocument(deletedFieldOptions, user),
  };
}
