import { isArray } from 'class-validator';
import { Model } from 'sequelize';
import { NotFoundError } from 'src/core/core.errors';
import { Job, JobResponse } from 'src/core/core.job';

type Constructor<T> = new (...args: any[]) => T;
export type ModelType<T extends Model<T>> = Constructor<T> & typeof Model;

export abstract class SqlService {
  constructor(private readonly model: ModelType<any>) {}

  /**
   * Create a new record using model's create method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async createRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.body)
        return { error: 'Error calling createRecord - body is missing' };
      if (!!job.owner && !!job.owner.id) {
        job.body.created_by = job.owner.id;
        job.body.updated_by = job.owner.id;
      }
      const fields = job.sql.fields || undefined;
      const include = job.sql.include || undefined;
      const transaction = job.sql.transaction || undefined;
      const data = await this.model.create(job.body, {
        fields,
        transaction,
        include,
      });
      if (!!include) {
        const dataWithInclude = await this.model.findByPk(data.id, {
          include,
        });
        return { data: dataWithInclude };
      }
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Create bulk records using model's bulkCreate method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async createBulkRecords(job: Job): Promise<JobResponse> {
    try {
      if (!job.records || !isArray(job.records) || !job.records.length)
        return {
          error: 'Error calling createBulkRecord - records are missing',
        };
      if (!!job.owner && !!job.owner.id) {
        job.records = job.records.map((x) => ({
          ...x,
          created_by: job.owner.id,
          updated_by: job.owner.id,
        }));
      }
      const fields = job.sql.fields || undefined;
      const transaction = job.sql.transaction || undefined;
      const data = await this.model.bulkCreate(job.records, {
        fields,
        transaction,
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Update a record using model's findByPk and save methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async updateRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.id)
        return { error: 'Error calling updateRecord - id is missing' };
      if (!job.body)
        return { error: 'Error calling updateRecord - body is missing' };
      if (!!job.owner && !!job.owner.id) {
        job.body.updated_by = job.owner.id;
      }
      const where = job.sql.where || {};
      const data = await this.model.findOne({
        where: { ...where, id: job.id },
      });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      for (const prop in job.body) {
        data[prop] = job.body[prop];
      }
      const fields = job.sql.fields || undefined;
      const include = job.sql.include || undefined;
      const transaction = job.sql.transaction || undefined;
      await data.save({ fields, transaction });
      if (!!include) {
        const dataWithInclude = await this.model.findByPk(data.id, {
          include,
        });
        return { data: dataWithInclude, previousData };
      }
      return { data, previousData };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Update bulk records using model's update methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async updateBulkRecords(job: Job): Promise<JobResponse> {
    try {
      if (!job.body)
        return { error: 'Error calling updateBulkRecords - body is missing' };
      if (!!job.owner && !!job.owner.id) {
        job.body.updated_by = job.owner.id;
      }
      const where = job.sql.where || undefined;
      const fields = job.sql.fields || undefined;
      const transaction = job.sql.transaction || undefined;
      const data = await this.model.update(job.body, {
        where,
        fields,
        transaction,
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Find and update a record using model's findOne and save methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findAndUpdateRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.sql.where)
        return {
          error: 'Error calling findAndUpdateRecord - sql.where is missing',
        };
      if (!job.body)
        return { error: 'Error calling findAndUpdateRecord - body is missing' };
      if (!!job.owner && !!job.owner.id) {
        job.body.updated_by = job.owner.id;
      }
      const where = job.sql.where || undefined;
      const fields = job.sql.fields || undefined;
      const transaction = job.sql.transaction || undefined;
      const data = await this.model.findOne({ where });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      for (const prop in job.body) {
        data[prop] = job.body[prop];
      }
      await data.save({ fields, transaction });
      return { data, previousData };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get paginated results using model's findAndCountAll method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async getAllRecords(job: Job): Promise<JobResponse> {
    try {
      const offset = job.sql.offset;
      const limit = job.sql.limit;
      const where = job.sql.where || undefined;
      const attributes = job.sql.attributes || undefined;
      const include = job.sql.include || undefined;
      const order = job.sql.order || undefined;
      const having = job.sql.having || undefined;
      const raw = job.sql.raw || undefined;
      const distinct = job.sql.distinct || undefined;
      const pagination = job.sql.pagination;
      const paranoid =
        typeof job.sql.paranoid === 'boolean' ? job.sql.paranoid : true;
      const options = {
        offset,
        limit,
        where,
        attributes,
        include,
        order,
        having,
        paranoid,
        raw,
        distinct,
      };
      if (pagination) {
        const data = await this.model.findAndCountAll(options);
        return { data: data.rows, offset, limit, count: data.count };
      } else {
        const data = await this.model.findAll(options);
        return { data: data, offset, limit, count: data.length };
      }
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get total count of record using model's findAndCountAll method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async countAllRecords(job: Job): Promise<JobResponse> {
    try {
      const where = job.sql.where || undefined;
      const attributes = job.sql.attributes || undefined;
      const include = job.sql.include || undefined;
      const distinct = job.sql.distinct || undefined;
      const paranoid =
        typeof job.sql.paranoid === 'boolean' ? job.sql.paranoid : true;
      const data = await this.model.count({
        where,
        attributes,
        include,
        paranoid,
        distinct,
      });
      return { count: data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Find a record using model's findByPk method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findRecordById(job: Job): Promise<JobResponse> {
    try {
      if (!job.id)
        return { error: 'Error calling findRecordById - id is missing' };
      const where = job.sql.where || {};
      const attributes = job.sql.attributes || undefined;
      const include = job.sql.include || undefined;
      const transaction = job.sql.transaction || undefined;
      const lock = job.sql.lock || undefined;
      const raw = job.sql.raw || undefined;
      const paranoid =
        typeof job.sql.paranoid === 'boolean' ? job.sql.paranoid : true;
      const data = await this.model.findOne({
        where: { ...where, id: job.id },
        attributes,
        include,
        paranoid,
        transaction,
        lock,
        raw,
      });
      if (data === null && !job.sql.allowEmpty)
        throw new NotFoundError('Record not found');
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Find a record using model's findOne method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findOneRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.sql.where)
        return {
          error: 'Error calling findOneRecord - sql.where is missing',
        };
      const where = job.sql.where || undefined;
      const attributes = job.sql.attributes || undefined;
      const include = job.sql.include || undefined;
      const order = job.sql.order || undefined;
      const group = job.sql.group || undefined;
      const having = job.sql.having || undefined;
      const transaction = job.sql.transaction || undefined;
      const lock = job.sql.lock || undefined;
      const raw = job.sql.raw || undefined;
      const paranoid =
        typeof job.sql.paranoid === 'boolean' ? job.sql.paranoid : true;
      const data = await this.model.findOne({
        where,
        attributes,
        include,
        order,
        group,
        having,
        paranoid,
        transaction,
        lock,
        raw,
      });
      if (data === null && !job.sql.allowEmpty)
        throw new NotFoundError('Record not found');
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Delete a record using model's destroy method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async deleteRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.id)
        return { error: 'Error calling deleteRecord - id is missing' };
      const where = job.sql.where || {};
      const data = await this.model.findOne({
        where: { ...where, id: job.id },
        paranoid: !job.sql.force,
      });
      if (data === null) throw new NotFoundError('Record not found');
      if (!!job.owner && !!job.owner.id) {
        data.updated_by = job.owner.id;
      }
      const transaction = job.sql.transaction || undefined;
      await data.destroy({
        force: !!job.sql.force,
        transaction,
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Find and delete a record using model's findOne and destroy methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findAndDeleteRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.sql.where)
        return {
          error: 'Error calling findAndDeleteRecord - sql.where is missing',
        };
      const where = job.sql.where || undefined;
      const data = await this.model.findOne({
        where,
        paranoid: !job.sql.force,
      });
      if (data === null) throw new NotFoundError('Record not found');
      if (!!job.owner && !!job.owner.id) {
        data.updated_by = job.owner.id;
      }
      const transaction = job.sql.transaction || undefined;
      await data.destroy({
        force: !!job.sql.force,
        transaction,
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Delete bulk records using model's destroy methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async deleteBulkRecords(job: Job): Promise<JobResponse> {
    try {
      const where = job.sql.where || undefined;
      const transaction = job.sql.transaction || undefined;
      const data = await this.model.destroy({
        where,
        force: !!job.sql.force,
        truncate: !!job.sql.truncate,
        transaction,
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Restore a soft deleted record using model's restore method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async restoreRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.id)
        return { error: 'Error calling restoreRecord - id is missing' };
      const data = await this.model.findByPk(job.id, {
        paranoid: false,
      });
      if (data === null) throw new NotFoundError('Record not found');
      if (!!job.owner && !!job.owner.id) {
        data.updated_by = job.owner.id;
      }
      const transaction = job.sql.transaction || undefined;
      await data.restore({ transaction });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Find a record or create if not exists
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findOrCreate(job: Job): Promise<JobResponse> {
    try {
      if (!job.body)
        return { error: 'Error calling findOrCreate - body is missing' };
      if (!job.sql.where)
        return {
          error: 'Error calling findOrCreate - sql.where is missing',
        };
      const where = job.sql.where || undefined;
      const attributes = job.sql.attributes || undefined;
      const include = job.sql.include || undefined;
      if (!!job.owner && !!job.owner.id) {
        job.body.created_by = job.owner.id;
        job.body.updated_by = job.owner.id;
      }
      const fields = job.sql.fields || undefined;
      const transaction = job.sql.transaction || undefined;
      const lock = job.sql.lock || undefined;
      const paranoid =
        typeof job.sql.paranoid === 'boolean' ? job.sql.paranoid : true;
      const [data, created] = await this.model.findCreateFind({
        defaults: job.body,
        where,
        attributes,
        include,
        paranoid,
        fields,
        transaction,
        lock,
      });
      return { data, created };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Update if exists or create a new record
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async createOrUpdate(job: Job): Promise<JobResponse> {
    try {
      if (!job.body)
        return { error: 'Error calling createOrUpdate - body is missing' };
      if (!job.sql.where)
        return {
          error: 'Error calling createOrUpdate - sql.where is missing',
        };
      const where = job.sql.where || undefined;
      const attributes = job.sql.attributes || undefined;
      const include = job.sql.include || undefined;
      const fields = job.sql.fields || undefined;
      const transaction = job.sql.transaction || undefined;
      const paranoid =
        typeof job.sql.paranoid === 'boolean' ? job.sql.paranoid : true;
      if (!!job.owner && !!job.owner.id) {
        job.body.created_by = job.owner.id;
        job.body.updated_by = job.owner.id;
      }
      const [data, created] = await this.model.findOrBuild({
        where,
        attributes,
        include,
        paranoid,
      });
      for (const prop in job.body) {
        data[prop] = job.body[prop];
      }
      await data.save({ fields, transaction });
      return { data, created };
    } catch (error) {
      return { error };
    }
  }

  /**
   * model's findAll method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findAllCustom(job: Job): Promise<JobResponse> {
    try {
      const data = await this.model.findAll(job.sql);
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * model's findOne method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findOneCustom(job: Job): Promise<JobResponse> {
    try {
      const data = await this.model.findOne(job.sql);
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
