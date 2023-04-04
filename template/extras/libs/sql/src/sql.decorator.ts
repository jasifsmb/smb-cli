import { isObject, isString } from 'class-validator';
import { FindAttributeOptions, Op } from 'sequelize';
import { SqlJob } from './sql.job';
import { convertPopulate, convertWhere, populateSelect } from './sql.utils';

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
  descriptor.value = function wrapper(job: SqlJob) {
    const payload = job.payload;
    const options = job.options;
    const select = payload.select || [];
    const where = convertWhere(payload.where || {});

    // set attributes and populated attributes
    const { attributes, populateAttributes } = populateSelect(
      select.map((x: string) => x.replace(/[^a-zA-Z0-9_.]/g, '')),
    );

    // set up populate with the select attributes
    const populate = [
      ...(payload.populate || []),
      ...populateAttributes.map((x) => x.association),
    ].filter((x: any, i: any, a: string | any[]) => a.indexOf(x) === i);

    /* add populate to sequelize include option */
    const include =
      options.include || convertPopulate(populate || [], populateAttributes);

    /* Search from searchFields, if payload.search key is set */
    where[Op.and] = where[Op.and] || [];
    if (payload.search && this.searchFields.length) {
      const whereOR = [];
      for (let index = 0; index < this.searchFields.length; index++) {
        const field = this.searchFields[index];
        whereOR.push({ [field]: { [Op.substring]: payload.search } });
      }
      where[Op.and].push({ [Op.or]: whereOR });
      if (this.searchPopulate.length) {
        for (let index = 0; index < this.searchPopulate.length; index++) {
          const association = this.searchPopulate[index];
          if (isObject(association)) {
            include.push(association);
          } else if (isString(association)) {
            const associationIndex = include.findIndex(
              (x) => (x.association || x) === association,
            );
            if (associationIndex === -1) {
              include.push({ association, include: [] });
            }
          }
        }
      }
    }

    job.options = {
      where: where || undefined,
      include: include || undefined,
      attributes: attributes.length ? attributes : undefined,
      offset: job.payload.offset ? +job.payload.offset : 0,
      limit: job.payload.limit,
      order: job.payload.order || undefined,
      having: job.payload.having || undefined,
      raw: job.payload.raw || undefined,
      distinct: job.payload.distinct || undefined,
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
  descriptor.value = function wrapper(job: SqlJob) {
    const payload = job.payload;
    const options = job.options;
    const select = payload.select || [];

    // set attributes and populated attributes
    const { attributes, populateAttributes } = populateSelect(
      select.map((x: string) => x.replace(/[^a-zA-Z0-9_.]/g, '')),
    );

    // set up populate with the select attributes
    const populate = [
      ...(payload.populate || []),
      ...populateAttributes.map((x) => x.association),
    ].filter((x: any, i: any, a: string | any[]) => a.indexOf(x) === i);

    /* add populate to sequelize include option */
    const include =
      options.include || convertPopulate(populate, populateAttributes);

    job.options = {
      where: payload.where || undefined,
      include: include || undefined,
      attributes: attributes.length ? attributes : undefined,
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
  descriptor.value = function wrapper(job: SqlJob) {
    const payload = job.payload;
    /* Check if hard delete */
    const force = payload.mode && payload.mode === 'hard';
    job.options = {
      where: payload.where || undefined,
      force,
    };
    return original.apply(this, [job]);
  };
};

const INCLUDE_ATTR_KEY = 'INCLUDE_ATTRIBUTES';

export function IncludeAttributes(attributes: FindAttributeOptions) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(INCLUDE_ATTR_KEY, attributes, target, propertyKey);
  };
}

export function getIncludeAttributes(
  model: any,
  propertyKey: string,
): FindAttributeOptions {
  return Reflect.getMetadata(INCLUDE_ATTR_KEY, new model(), propertyKey);
}
