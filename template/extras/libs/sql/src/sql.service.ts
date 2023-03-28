import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { isArray } from 'class-validator';
import { Connection } from 'mongoose';
import { Model, ModelStatic } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { NotFoundError } from 'src/core/core.errors';
import { addDays } from 'src/core/core.utils';
import {
  SqlCountResponse,
  SqlCreateBulkResponse,
  SqlCreateResponse,
  SqlDeleteResponse,
  SqlGetAllResponse,
  SqlGetOneResponse,
  SqlJob,
  SqlResponse,
  SqlUpdateResponse,
} from './sql.job';
import { SqlOption } from './sql.module';

export type ModelWrap<T> = Model<T, T>;

@Injectable()
export class SqlService<M> {
  private model: ModelStatic<Model<any, any>>;

  constructor(
    @Inject('MODEL_NAME') modelName: string,
    @Inject('MODEL_OPTIONS') private options: SqlOption,
    sequelize: Sequelize,
    @InjectConnection() private connection: Connection,
  ) {
    this.model = sequelize.models[modelName];
  }

  /**
   * Create a new record using model's create method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async createRecord(job: SqlJob): Promise<SqlCreateResponse<M>> {
    try {
      if (!job.body)
        return { error: 'Error calling createRecord - body is missing' };
      if (job.owner && job.owner.id) {
        job.body.created_by = job.owner.id;
        job.body.updated_by = job.owner.id;
      }
      const fields = job.options.fields || undefined;
      const include = job.options.include || undefined;
      const transaction = job.options.transaction || undefined;
      const data = await this.model.create(job.body, {
        fields,
        transaction,
        include,
      });

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          entity_id: data.getDataValue('id'),
          action: 'CreateRecord',
          created: true,
          data: data.toJSON(),
          expire_in: addDays(this.options.historyExpireIn),
        });
      }

      if (include) {
        const dataWithInclude = await this.model.findByPk(
          data.getDataValue('id'),
          {
            include,
          },
        );
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
  async createBulkRecords(job: SqlJob): Promise<SqlCreateBulkResponse<M>> {
    try {
      if (!job.records || !isArray(job.records) || !job.records.length)
        return {
          error: 'Error calling createBulkRecord - records are missing',
        };
      if (job.owner && job.owner.id) {
        job.records = job.records.map((x) => ({
          ...x,
          created_by: job.owner.id,
          updated_by: job.owner.id,
        }));
      }
      const fields = job.options.fields || undefined;
      const transaction = job.options.transaction || undefined;
      const data = await this.model.bulkCreate(job.records, {
        fields,
        transaction,
      });

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          action: 'CreateBulkRecords',
          created: true,
          data: data,
          expire_in: addDays(this.options.historyExpireIn),
        });
      }

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
  async updateRecord(job: SqlJob): Promise<SqlUpdateResponse<M>> {
    try {
      if (!job.id)
        return { error: 'Error calling updateRecord - id is missing' };
      if (!job.body)
        return { error: 'Error calling updateRecord - body is missing' };
      if (job.owner && job.owner.id) {
        job.body.updated_by = job.owner.id;
      }
      const pk = job.pk;
      const where = job.options.where || {};
      const data = await this.model.findOne({
        where: { ...where, [pk]: job.id },
      });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      for (const prop in job.body) {
        data[prop] = job.body[prop];
      }
      const fields = job.options.fields || undefined;
      const include = job.options.include || undefined;
      const transaction = job.options.transaction || undefined;
      await data.save({ fields, transaction });

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          entity_id: data.getDataValue('id'),
          action: 'UpdateRecord',
          data: data.toJSON(),
          previous_data: previousData,
          expire_in: addDays(this.options.historyExpireIn),
        });
      }

      if (include) {
        const dataWithInclude = await this.model.findByPk(
          data.getDataValue('id'),
          {
            include,
          },
        );
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
  async updateBulkRecords(job: SqlJob): Promise<SqlResponse<[number]>> {
    try {
      if (!job.body)
        return { error: 'Error calling updateBulkRecords - body is missing' };
      if (job.owner && job.owner.id) {
        job.body.updated_by = job.owner.id;
      }
      const where = job.options.where || undefined;
      const fields = job.options.fields || undefined;
      const transaction = job.options.transaction || undefined;
      const data = await this.model.update(job.body, {
        where,
        fields,
        transaction,
      });

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          action: 'UpdateBulkRecords',
          data: data,
          expire_in: addDays(this.options.historyExpireIn),
        });
      }

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
  async findAndUpdateRecord(job: SqlJob): Promise<SqlUpdateResponse<M>> {
    try {
      if (!job.options.where)
        return {
          error: 'Error calling findAndUpdateRecord - sql.where is missing',
        };
      if (!job.body)
        return { error: 'Error calling findAndUpdateRecord - body is missing' };
      if (job.owner && job.owner.id) {
        job.body.updated_by = job.owner.id;
      }
      const where = job.options.where || undefined;
      const fields = job.options.fields || undefined;
      const transaction = job.options.transaction || undefined;
      const data = await this.model.findOne({
        where,
      });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      for (const prop in job.body) {
        data[prop] = job.body[prop];
      }
      await data.save({ fields, transaction });

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          entity_id: data.getDataValue('id'),
          action: 'FindAndUpdateRecord',
          data: data.toJSON(),
          previous_data: previousData,
          expire_in: addDays(this.options.historyExpireIn),
        });
      }

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
  async getAllRecords(job: SqlJob): Promise<SqlGetAllResponse<M>> {
    try {
      const offset = job.options.offset;
      const limit = job.options.limit;
      const where = job.options.where || undefined;
      const attributes = job.options.attributes || undefined;
      const include = job.options.include || undefined;
      const order = job.options.order || undefined;
      const having = job.options.having || undefined;
      const raw = job.options.raw || undefined;
      const distinct = job.options.distinct || undefined;
      const pagination = job.options.pagination;
      const paranoid =
        typeof job.options.paranoid === 'boolean' ? job.options.paranoid : true;
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
  async countAllRecords(job: SqlJob): Promise<SqlCountResponse> {
    try {
      const where = job.options.where || undefined;
      const attributes = job.options.attributes || undefined;
      const include = job.options.include || undefined;
      const distinct = job.options.distinct || undefined;
      const paranoid =
        typeof job.options.paranoid === 'boolean' ? job.options.paranoid : true;
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
  async findRecordById(job: SqlJob): Promise<SqlGetOneResponse<M>> {
    try {
      if (!job.id)
        return { error: 'Error calling findRecordById - id is missing' };
      const pk = job.pk;
      const where = job.options.where || {};
      const attributes = job.options.attributes || undefined;
      const include = job.options.include || undefined;
      const transaction = job.options.transaction || undefined;
      const lock = job.options.lock || undefined;
      const raw = job.options.raw || undefined;
      const paranoid =
        typeof job.options.paranoid === 'boolean' ? job.options.paranoid : true;
      const data = await this.model.findOne({
        where: { ...where, [pk]: job.id },
        attributes,
        include,
        paranoid,
        transaction,
        lock,
        raw,
      });
      if (data === null && !job.options.allowEmpty)
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
  async findOneRecord(job: SqlJob): Promise<SqlGetOneResponse<M>> {
    try {
      if (!job.options.where)
        return {
          error: 'Error calling findOneRecord - sql.where is missing',
        };
      const where = job.options.where || undefined;
      const attributes = job.options.attributes || undefined;
      const include = job.options.include || undefined;
      const order = job.options.order || undefined;
      const group = job.options.group || undefined;
      const having = job.options.having || undefined;
      const transaction = job.options.transaction || undefined;
      const lock = job.options.lock || undefined;
      const raw = job.options.raw || undefined;
      const paranoid =
        typeof job.options.paranoid === 'boolean' ? job.options.paranoid : true;
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
      if (data === null && !job.options.allowEmpty)
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
  async deleteRecord(job: SqlJob): Promise<SqlDeleteResponse<M>> {
    try {
      if (!job.id)
        return { error: 'Error calling deleteRecord - id is missing' };
      const pk = job.pk;
      const where = job.options.where || {};
      const data = await this.model.findOne({
        where: { ...where, [pk]: job.id },
        paranoid: !job.options.force,
      });
      if (data === null) throw new NotFoundError('Record not found');
      if (job.owner && job.owner.id) {
        data.setDataValue('updated_by', job.owner.id);
      }
      const transaction = job.options.transaction || undefined;
      await data.destroy({
        force: !!job.options.force,
        transaction,
      });
      if (job.options.force) {
        await this.connection.models.Trash.create({
          entity: this.model.name,
          entity_id: data.getDataValue('id'),
          action: 'DeleteRecord',
          data: data.toJSON(),
          expire_in: addDays(this.options.trashExpireIn),
        });
      }
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
  async findAndDeleteRecord(job: SqlJob): Promise<SqlDeleteResponse<M>> {
    try {
      if (!job.options.where)
        return {
          error: 'Error calling findAndDeleteRecord - sql.where is missing',
        };
      const where = job.options.where || undefined;
      const data = await this.model.findOne({
        where,
        paranoid: !job.options.force,
      });
      if (data === null) throw new NotFoundError('Record not found');
      if (job.owner && job.owner.id) {
        data.setDataValue('updated_by', job.owner.id);
      }
      const transaction = job.options.transaction || undefined;
      await data.destroy({
        force: !!job.options.force,
        transaction,
      });

      if (job.options.force) {
        this.connection.models.Trash.create({
          entity: this.model.name,
          entity_id: data.getDataValue('id'),
          action: 'FindAndDeleteRecord',
          data: data.toJSON(),
          expire_in: addDays(this.options.trashExpireIn),
        });
      }
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
  async deleteBulkRecords(job: SqlJob): Promise<SqlResponse<number>> {
    try {
      const where = job.options.where || undefined;
      const transaction = job.options.transaction || undefined;
      const data = await this.model.destroy({
        where,
        force: !!job.options.force,
        truncate: !!job.options.truncate,
        transaction,
      });

      if (job.options.force) {
        this.connection.models.Trash.create({
          entity: this.model.name,
          action: 'FindAndDeleteRecord',
          data: data,
          expire_in: addDays(this.options.trashExpireIn),
        });
      }
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
  async restoreRecord(job: SqlJob): Promise<SqlGetOneResponse<M>> {
    try {
      if (!job.id)
        return { error: 'Error calling restoreRecord - id is missing' };
      const data = await this.model.findByPk(job.id, {
        paranoid: false,
      });
      if (data === null) throw new NotFoundError('Record not found');
      if (job.owner && job.owner.id) {
        data.setDataValue('updated_by', job.owner.id);
      }
      const transaction = job.options.transaction || undefined;
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
  async findOrCreate(job: SqlJob): Promise<SqlCreateResponse<M>> {
    try {
      if (!job.body)
        return { error: 'Error calling findOrCreate - body is missing' };
      if (!job.options.where)
        return {
          error: 'Error calling findOrCreate - sql.where is missing',
        };
      const where = job.options.where || undefined;
      const attributes = job.options.attributes || undefined;
      const include = job.options.include || undefined;
      if (job.owner && job.owner.id) {
        job.body.created_by = job.owner.id;
        job.body.updated_by = job.owner.id;
      }
      const fields = job.options.fields || undefined;
      const transaction = job.options.transaction || undefined;
      const lock = job.options.lock || undefined;
      const paranoid =
        typeof job.options.paranoid === 'boolean' ? job.options.paranoid : true;
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

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          entity_id: data.getDataValue('id'),
          action: 'FindOrCreate',
          created,
          data: data.toJSON(),
          expire_in: addDays(this.options.historyExpireIn),
        });
      }

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
  async createOrUpdate(job: SqlJob): Promise<SqlCreateResponse<M>> {
    try {
      if (!job.body)
        return { error: 'Error calling createOrUpdate - body is missing' };
      if (!job.options.where)
        return {
          error: 'Error calling createOrUpdate - sql.where is missing',
        };
      const where = job.options.where || undefined;
      const attributes = job.options.attributes || undefined;
      const include = job.options.include || undefined;
      const fields = job.options.fields || undefined;
      const transaction = job.options.transaction || undefined;
      const paranoid =
        typeof job.options.paranoid === 'boolean' ? job.options.paranoid : true;
      if (job.owner && job.owner.id) {
        job.body.created_by = job.owner.id;
        job.body.updated_by = job.owner.id;
      }
      const [data, created] = await this.model.findOrBuild({
        where,
        attributes,
        include,
        paranoid,
      });
      const previousData = data.toJSON();
      for (const prop in job.body) {
        data[prop] = job.body[prop];
      }
      await data.save({ fields, transaction });

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          entity_id: data.getDataValue('id'),
          action: 'CreateOrUpdate',
          created,
          data: data.toJSON(),
          previous_data: !created ? previousData : null,
          expire_in: addDays(this.options.historyExpireIn),
        });
      }

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
  async _findAll(job: SqlJob): Promise<SqlGetAllResponse<M>> {
    try {
      const data = await this.model.findAll(job.options);
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
  async _findOne(job: SqlJob): Promise<SqlGetOneResponse<M>> {
    try {
      const data = await this.model.findOne(job.options);
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
