import { isObject, isString } from 'class-validator';
import { Op } from 'sequelize';
import config from 'src/config';
import { convertPopulate, convertWhere } from 'src/core/core.utils';
import { SqlJob } from './sql.job';

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
    const attributes = select.map((x) => x.replace(/[^a-zA-Z0-9_]/g, ''));
    /* add populate to sequelize include option */
    const include = options.include || convertPopulate(payload.populate || []);
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
      limit: job.payload.limit
        ? +job.payload.limit === -1
          ? 1000
          : +job.payload.limit
        : config().paginationLimit,
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
    /* add populate to sequelize include option */
    const include = options.include || convertPopulate(payload.populate || []);

    job.options = {
      where: payload.where || undefined,
      include: include || undefined,
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
