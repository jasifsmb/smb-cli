import { UpdateQuery } from 'mongoose';
import Deleted from '../types/Deleted';
import DeletedFieldOptions from '../types/DeletedFieldOptions';
import deletedProp from './deleteProp';

export default function restoreDocument({
  deletedAt,
  deletedBy,
}: DeletedFieldOptions): Record<string, unknown> {
  return {
    deleted: false,
    ...deletedProp(deletedAt, undefined),
    ...deletedProp(deletedBy, undefined),
  };
}

export function staticRestore({
  deletedAt,
  deletedBy,
}: DeletedFieldOptions): UpdateQuery<Deleted> {
  return {
    $set: { deleted: false },
    $unset: {
      ...deletedProp(deletedAt, 1),
      ...deletedProp(deletedBy, 1),
    },
  };
}
