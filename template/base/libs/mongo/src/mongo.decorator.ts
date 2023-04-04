import { VirtualTypeOptions } from 'mongoose';
import { MongoJob } from './mongo.job';
import { convertPopulate, populateSelect } from './mongo.utils';

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
    const options = job.options;
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

    // set attributes and populated attributes
    const { attributes, populateAttributes } = populateSelect(
      select.map((x: string) => x.replace(/[^a-zA-Z0-9_.]/g, '')),
    );

    // set up populate with the select attributes
    const populate = [
      ...(payload.populate || []),
      ...populateAttributes.map((x) => x.path),
    ].filter((x: any, i: any, a: string | any[]) => a.indexOf(x) === i);

    /* add populate to sequelize include option */
    const include =
      options.include || convertPopulate(populate || [], populateAttributes);

    let sort = job.payload.sort || [];
    if (typeof sort[0] === 'string') {
      sort = [sort];
    }
    sort = sort.map((x) => ({ [x[0]]: x[1] }));

    job.options = {
      where: where || undefined,
      populate: include,
      sort: sort,
      projection: attributes.length ? attributes.join(' ') : undefined,
      skip: job.payload.offset ? +job.payload.offset : 0,
      limit: job.payload.limit,
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
    const options = job.options;
    const select = payload.select || [];

    //set attributes and populated attributes
    const { attributes, populateAttributes } = populateSelect(
      select.map((x: string) => x.replace(/[^a-zA-Z0-9_.]/g, '')),
    );

    // set up populate with the select attributes
    const populate = [
      ...(payload.populate || []),
      ...populateAttributes.map((x) => x.path),
    ].filter((x: any, i: any, a: string | any[]) => a.indexOf(x) === i);

    /* add populate to sequelize include option */
    const include =
      options.populate || convertPopulate(populate || [], populateAttributes);

    job.options = {
      where: payload.where || undefined,
      populate: include || undefined,
      projection: attributes.length ? attributes.join(' ') : undefined,
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

/**
 * Mongo Populate
 *
 */
const POPULATE_KEY = 'POPULATE_KEY';

export interface PopulateWithOption {
  name: string;
  options: VirtualTypeOptions;
}

export function setPopulate(
  options: VirtualTypeOptions,
  target: any,
  propertyKey: string,
) {
  Reflect.defineMetadata(POPULATE_KEY, options, target, propertyKey);
  const populates: string[] = Reflect.getMetadata(POPULATE_KEY, target) || [];
  populates.push(propertyKey);
  Reflect.defineMetadata(POPULATE_KEY, populates, target);
}

export function Populate(options: VirtualTypeOptions) {
  return function (target: any, propertyKey: string) {
    setPopulate(options, target, propertyKey);
  };
}

export function MongoBelongsTo(
  ref: string,
  localField: string,
  options?: VirtualTypeOptions['options'],
) {
  return function (target: any, propertyKey: string) {
    const _options: VirtualTypeOptions = {
      ref,
      localField,
      foreignField: '_id',
      justOne: true,
      options,
    };
    setPopulate(_options, target, propertyKey);
  };
}

export function MongoHasOne(
  ref: string,
  foreignField: string,
  options?: VirtualTypeOptions['options'],
) {
  return function (target: any, propertyKey: string) {
    const _options: VirtualTypeOptions = {
      ref,
      localField: '_id',
      foreignField,
      justOne: true,
      options,
    };
    setPopulate(_options, target, propertyKey);
  };
}

export function MongoBelongsToMany(
  ref: string,
  localField: string,
  options?: VirtualTypeOptions['options'],
) {
  return function (target: any, propertyKey: string) {
    const _options: VirtualTypeOptions = {
      ref,
      localField,
      foreignField: '_id',
      options,
    };
    setPopulate(_options, target, propertyKey);
  };
}

export function MongoHasMany(
  ref: string,
  foreignField: string,
  options?: VirtualTypeOptions['options'],
) {
  return function (target: any, propertyKey: string) {
    const _options: VirtualTypeOptions = {
      ref,
      localField: '_id',
      foreignField,
      options,
    };
    setPopulate(_options, target, propertyKey);
  };
}

export function getPopulates(model: any): PopulateWithOption[] {
  const populates: string[] =
    Reflect.getMetadata(POPULATE_KEY, new model()) || [];
  return populates.map((prop) => ({
    name: prop,
    options: Reflect.getMetadata(POPULATE_KEY, new model(), prop),
  }));
}
