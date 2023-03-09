import config from 'src/config';
import { Job } from 'src/core/core.job';

/**
 * Decorator for converting request job.payload to job.sql
 *
 * job object will be available for model's methods as a parameter
 */
export const ReadPayload = (target, methodName, descriptor) => {
  const original = descriptor.value;
  descriptor.value = function wrapper(job: Job) {
    const payload = job.payload;
    const select = payload.select || [];
    const where = payload.where || {};
    if (!!payload.search && !!this.searchFields.length) {
      where.$and = where.$and || [];
      const whereOR = [];
      for (let index = 0; index < this.searchFields.length; index++) {
        const field = this.searchFields[index];
        whereOR.push({ [field]: { $regex: new RegExp(payload.search, 'i') } });
      }
      where.$and.push({ $or: whereOR });
    }
    const attributes = select.map((x) => x.replace(/[^a-zA-Z0-9_]/g, ''));
    let populate: any = job.payload.populate || [];
    populate = populate.map((x) => ({ path: x }));
    let sort = job.payload.sort || [];
    if (typeof sort[0] === 'string') {
      sort = [sort];
    }
    sort = sort.map((x) => ({ [x[0]]: x[1] }));

    job.mongo = {
      ...job.payload,
      where: where || undefined,
      populate: populate,
      sort: sort,
      projection: attributes.length ? attributes.join(' ') : undefined,
      offset: job.payload.offset ? +job.payload.offset : 0,
      limit: job.payload.limit
        ? +job.payload.limit === -1
          ? 1000
          : +job.payload.limit
        : config().paginationLimit,
      mongooseOptions: job.payload.mongooseOptions || {},
      pagination: job.payload.pagination ?? true,
    };
    return original.apply(this, [job]);
  };
};

/**
 * Decorator for converting request job.payload to job.sql
 *
 * job object will be available for model's methods as a parameter
 */
export const WritePayload = (target, methodName, descriptor) => {
  const original = descriptor.value;
  descriptor.value = function wrapper(job: Job) {
    const payload = job.payload;
    let populate: any = payload.populate || [];
    populate = populate.map((x) => ({ path: x }));

    job.mongo = {
      ...job.payload,
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
export const DeletePayload = (target, methodName, descriptor) => {
  const original = descriptor.value;
  descriptor.value = function wrapper(job: Job) {
    const payload = job.payload;
    job.mongo = {
      ...job.payload,
      where: payload.where || undefined,
    };
    return original.apply(this, [job]);
  };
};
