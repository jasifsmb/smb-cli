/* eslint-disable @typescript-eslint/ban-types */
import { DeleteResult } from 'mongodb';
import {
  Callback,
  FilterQuery,
  Model,
  QueryOptions,
  QueryWithHelpers,
  UpdateWriteOpResult,
} from 'mongoose';
import DeletedFieldOptions from './types/DeletedFieldOptions';
import DeletedSchema from './types/DeletedSchema';
import { staticDelete } from './utils/deleteDocument';
import getOverloadedArguments from './utils/getOverloadedArguments';
import { staticRestore } from './utils/restoreDocument';

export interface DeletedQueryOptions extends QueryOptions {
  /* Hard delete */
  force: boolean;
}

export interface DeletedStaticMethods<T, TQueryHelpers = {}> {
  restoreOne(
    filter?: FilterQuery<T>,
    options?: QueryOptions | null,
    callbackArg?: Callback<T>,
  ): QueryWithHelpers<UpdateWriteOpResult, T, TQueryHelpers>;
  restoreOne(
    filter?: FilterQuery<T>,
    callback?: Callback,
  ): QueryWithHelpers<UpdateWriteOpResult, T, TQueryHelpers>;
  restoreOne(
    callback?: Callback,
  ): QueryWithHelpers<UpdateWriteOpResult, T, TQueryHelpers>;

  restoreMany(
    filter?: FilterQuery<T>,
    options?: QueryOptions | null,
    callback?: Callback,
  ): QueryWithHelpers<UpdateWriteOpResult, T, TQueryHelpers>;
  restoreMany(
    filter?: FilterQuery<T>,
    callback?: Callback,
  ): QueryWithHelpers<UpdateWriteOpResult, T, TQueryHelpers>;
  restoreMany(
    callback?: Callback,
  ): QueryWithHelpers<UpdateWriteOpResult, T, TQueryHelpers>;
}

export interface DeletedByStaticMethods<T, TUser = any, TQueryHelpers = {}> {
  deleteMany(
    filter?: FilterQuery<T>,
    options?: DeletedQueryOptions,
    callback?: Callback,
  ): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;
  deleteMany(
    filter: FilterQuery<T>,
    callback: Callback,
  ): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;
  deleteMany(
    callback: Callback,
  ): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;

  deleteManyByUser(
    user: TUser,
    filter?: FilterQuery<T>,
    options?: QueryOptions,
    callback?: Callback,
  ): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;
  deleteManyByUser(
    user: TUser,
    filter: FilterQuery<T>,
    callback: Callback,
  ): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;
  deleteManyByUser(
    user: TUser,
    callback: Callback,
  ): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;

  deleteOneByUser(
    user: TUser,
    filter?: FilterQuery<T>,
    options?: QueryOptions,
    callback?: Callback,
  ): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;
  deleteOneByUser(
    user: TUser,
    filter: FilterQuery<T>,
    callback: Callback,
  ): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;
  deleteOneByUser(
    user: TUser,
    callback: Callback,
  ): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;
}

export default function (
  schema: DeletedSchema,
  deletedFieldOptions: DeletedFieldOptions,
): void {
  schema.statics.deleteOne = async function <T>(
    filterArg?: FilterQuery<T>,
    optionsArg?: QueryOptions | null,
    callbackArg?: Callback,
  ) {
    const [filter, options, callback] = getOverloadedArguments(
      filterArg,
      optionsArg,
      callbackArg,
    );

    const update = staticDelete(deletedFieldOptions);
    const result = await Model.updateOne.apply(this, [
      filter,
      update,
      options,
      callback,
    ]);
    return convertToDeleteResult(result);
  };
  schema.statics.deleteMany = async function <T>(
    filterArg?: FilterQuery<T>,
    optionsArg?: DeletedQueryOptions | null,
    callbackArg?: Callback,
  ) {
    const [filter, options, callback] = getOverloadedArguments(
      filterArg,
      optionsArg,
      callbackArg,
    );
    if (optionsArg?.force) {
      const result = await Model.deleteMany.apply(this, [
        filter,
        options,
        callback,
      ]);
      return result;
    }
    const update = staticDelete(deletedFieldOptions);
    const result = await Model.updateMany.apply(this, [
      filter,
      update,
      options,
      callback,
    ]);
    return convertToDeleteResult(result);
  };

  schema.statics.deleteOneByUser = async function <TUser, T>(
    user: TUser,
    filterArg?: FilterQuery<T>,
    optionsArg?: QueryOptions | null,
    callbackArg?: Callback,
  ) {
    const [filter, options, callback] = getOverloadedArguments(
      filterArg,
      optionsArg,
      callbackArg,
    );

    const update = staticDelete(deletedFieldOptions, user);
    const result = await Model.updateOne.apply(this, [
      filter,
      update,
      options,
      callback,
    ]);
    return convertToDeleteResult(result);
  };
  schema.statics.deleteManyByUser = async function <TUser, T>(
    user: TUser,
    filterArg?: FilterQuery<T>,
    optionsArg?: QueryOptions | null,
    callbackArg?: Callback,
  ) {
    const [filter, options, callback] = getOverloadedArguments(
      filterArg,
      optionsArg,
      callbackArg,
    );

    const update = staticDelete(deletedFieldOptions, user);
    const result = await Model.updateMany.apply(this, [
      filter,
      update,
      options,
      callback,
    ]);
    return convertToDeleteResult(result);
  };

  schema.statics.findOneAndDelete = function <T>(
    filter?: FilterQuery<T>,
    options?: QueryOptions | null,
    callback?: Callback,
  ) {
    const update = staticDelete(deletedFieldOptions);
    return Model.findOneAndUpdate.apply(this, [
      filter,
      update,
      options,
      callback,
    ]);
  };
  schema.statics.findByIdAndDelete = function (
    id: any,
    options?: QueryOptions | null,
    callback?: Callback,
  ) {
    const update = staticDelete(deletedFieldOptions);
    return Model.findByIdAndUpdate.apply(this, [
      id,
      update,
      options,
      callback,
    ] as any);
  };

  schema.statics.restoreOne = function <T>(
    filterArg?: FilterQuery<T>,
    optionsArg?: QueryOptions | null,
    callbackArg?: Callback,
  ) {
    const [filter, options, callback] = getOverloadedArguments(
      filterArg,
      optionsArg,
      callbackArg,
    );
    Object.assign(options, { ignoreDeleted: true });

    const update = staticRestore(deletedFieldOptions);
    return Model.updateOne.apply(this, [
      filter,
      update,
      options,
      callback,
    ]) as any;
  };
  schema.statics.restoreMany = function <T>(
    filterArg?: FilterQuery<T>,
    optionsArg?: QueryOptions | null,
    callbackArg?: Callback,
  ) {
    const [filter, options, callback] = getOverloadedArguments(
      filterArg,
      optionsArg,
      callbackArg,
    );
    Object.assign(options, { ignoreDeleted: true });

    const update = staticRestore(deletedFieldOptions);
    return Model.updateMany.apply(this, [
      filter,
      update,
      options,
      callback,
    ]) as any;
  };
}

function convertToDeleteResult(result: UpdateWriteOpResult): DeleteResult {
  return {
    acknowledged: result.acknowledged,
    deletedCount: result.modifiedCount,
  };
}
