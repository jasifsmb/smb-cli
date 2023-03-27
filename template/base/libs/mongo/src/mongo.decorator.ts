import { PopulateOptions } from 'mongoose';
import config from 'src/config';
import { MongoJob } from './mongo.job';

/**
 * Decorator for converting request job.payload to job.sql
 *
 * job object will be available for model's methods as a parameter
 */
export const ReadPayload = (
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor,
) => {
  const original = descriptor.value;
  descriptor.value = function wrapper(job: MongoJob) {
    const payload = job.payload;
    const select: string[] = payload.select || [];
    const where = payload.where || {};
    if (payload.search && this.searchFields.length) {
      where.$and = where.$and || [];
      const whereOR = [];
      for (let index = 0; index < this.searchFields.length; index++) {
        const field = this.searchFields[index];
        whereOR.push({ [field]: { $regex: new RegExp(payload.search, 'i') } });
      }
      where.$and.push({ $or: whereOR });
    }
    const attributes = select.map((x) => x.replace(/[^a-zA-Z0-9_]/g, ''));
    const populate = (job.payload.populate || []).map((x: string) => ({
      path: x,
    }));
    let sort = job.payload.sort || [];
    if (typeof sort[0] === 'string') {
      sort = [sort];
    }
    sort = sort.map((x) => ({ [x[0]]: x[1] }));

    job.options = {
      where: where || undefined,
      populate: populate,
      sort: sort,
      projection: attributes.length ? attributes.join(' ') : undefined,
      skip: job.payload.offset ? +job.payload.offset : 0,
      limit: job.payload.limit
        ? +job.payload.limit === -1
          ? 1000
          : +job.payload.limit
        : config().paginationLimit,
      pagination: true,
    };
    return original.apply(this, [job]);
  };
};

/**
 * Decorator for converting request job.payload to job.sql
 *
 * job object will be available for model's methods as a parameter
 */
export const WritePayload = (
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor,
) => {
  const original = descriptor.value;
  descriptor.value = function wrapper(job: MongoJob) {
    const payload = job.payload;
    const populate: PopulateOptions[] = (job.payload.populate || []).map(
      (x: string) => ({
        path: x,
      }),
    );

    job.options = {
      where: payload.where || undefined,
      populate: populate || undefined,
    };
    return original.apply(this, [job]);
  };
};

/**
 * Decorator for converting request job.payload to job.sql
 *
 * job object will be available for model's methods as a parameter
 */
export const DeletePayload = (
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor,
) => {
  const original = descriptor.value;
  descriptor.value = function wrapper(job: MongoJob) {
    const payload = job.payload;
    /* Check if hard delete */
    const hardDelete = payload.mode && payload.mode === 'hard';
    job.options = {
      where: payload.where || undefined,
      hardDelete,
    };
    return original.apply(this, [job]);
  };
};
