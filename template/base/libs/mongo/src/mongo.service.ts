import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { isArray } from 'class-validator';
import { Connection, HydratedDocument, Model } from 'mongoose';
import { NotFoundError } from 'src/core/core.errors';
import { addDays } from 'src/core/core.utils';
import {
  MongoCountResponse,
  MongoCreateBulkResponse,
  MongoCreateResponse,
  MongoDeleteResponse,
  MongoGetAllResponse,
  MongoGetOneResponse,
  MongoJob,
  MongoResponse,
  MongoUpdateResponse,
} from './mongo.job';
import { MongoOption } from './mongo.module';
import {
  Deleted,
  DeletedAt,
  DeletedBy,
  DeletedByMethods,
  DeletedByStaticMethods,
  DeletedMethods,
  DeletedQuery,
  DeletedStaticMethods,
} from './plugins/soft-delete';

export type ModelWrap<T> = HydratedDocument<MongoDocument<T>>;
export type MongoDocument<T> = Document &
  Deleted &
  DeletedMethods &
  DeletedAt &
  DeletedBy &
  DeletedByMethods &
  T;
export type MongoModel<T> = Model<MongoDocument<T>, DeletedQuery<T>> &
  DeletedStaticMethods<MongoDocument<T>> &
  DeletedByStaticMethods<MongoDocument<T>>;

@Injectable()
export class MongoService<M> {
  private model: MongoModel<M>;

  constructor(
    @Inject('MODEL_NAME') modelName: string,
    @Inject('MODEL_OPTIONS') private options: MongoOption,
    @InjectConnection() private connection: Connection,
  ) {
    this.model = <MongoModel<M>>connection.models[modelName];
  }

  /**
   * Create a new record using model's create method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async createRecord(job: MongoJob): Promise<MongoCreateResponse<M>> {
    try {
      if (!job.body)
        return { error: 'Error calling createRecord - body is missing' };
      if (job.owner && job.owner.id) {
        job.body.created_by = job.owner.id;
        job.body.updated_by = job.owner.id;
      }
      const populate = job.options.populate || [];
      let data = new this.model(job.body);
      await data.save();

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          entity_id: data._id,
          action: 'CreateRecord',
          created: true,
          data: JSON.parse(JSON.stringify(data)),
          expire_in: addDays(this.options.historyExpireIn),
        });
      }

      if (populate) {
        data = await data.populate(populate);
      }
      return { data, created: true };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Create bulk records using model's bulkCreate method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async createBulkRecords(job: MongoJob): Promise<MongoCreateBulkResponse<M>> {
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
      const data = await this.model.create(job.records);

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          action: 'CreateBulkRecords',
          created: true,
          data: JSON.parse(JSON.stringify(data)),
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
  async updateRecord(job: MongoJob): Promise<MongoUpdateResponse<M>> {
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
      const populate: any = job.options.populate || [];
      let data = await this.model.findOne({
        ...where,
        [pk]: job.id,
      });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      for (const prop in job.body) {
        data[prop] = job.body[prop];
      }
      await data.save();
      if (populate.length) {
        data = await data.populate(populate);
      }

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          entity_id: data._id,
          action: 'UpdateRecord',
          data: JSON.parse(JSON.stringify(data)),
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
   * Find and update a record using model's findOne and save methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findAndUpdateRecord(job: MongoJob): Promise<MongoUpdateResponse<M>> {
    try {
      if (!job.options.where)
        return {
          error: 'Error calling findAndUpdateRecord - options.where is missing',
        };
      if (!job.body)
        return { error: 'Error calling findAndUpdateRecord - body is missing' };
      if (job.owner && job.owner.id) {
        job.body.updated_by = job.owner.id;
      }
      const where = job.options.where || undefined;
      const data = await this.model.findOne({ ...where });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      for (const prop in job.body) {
        data[prop] = job.body[prop];
      }
      await data.save();

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          entity_id: data._id,
          action: 'FindAndUpdateRecord',
          data: JSON.parse(JSON.stringify(data)),
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
   * Update bulk records using model's update methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async updateBulkRecords(job: MongoJob): Promise<MongoResponse> {
    try {
      if (!job.body)
        return { error: 'Error calling updateBulkRecords - body is missing' };
      if (job.owner && job.owner.id) {
        job.body.updated_by = job.owner.id;
      }
      const where = job.options.where || undefined;
      const data = await this.model.updateMany({ ...where }, job.body);
      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          action: 'UpdateBulkRecords',
          data: JSON.parse(JSON.stringify(data)),
          expire_in: addDays(this.options.historyExpireIn),
        });
      }
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get paginated results using model's findAndCountAll method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async getAllRecords(job: MongoJob): Promise<MongoGetAllResponse<M>> {
    try {
      const skip = job.options.skip ? +job.options.skip : 0;
      const limit = job.options.limit;
      const where = job.options.where || {};
      const populate: any = job.options.populate || [];
      const projection = job.options.projection || undefined;
      const sort = job.options.sort || [];
      const pagination = job.options.pagination ?? false;
      const mongooseOptions = job.options.mongooseOptions || {};
      const options = {
        skip,
        limit,
        populate,
        sort,
        ...mongooseOptions,
      };
      if (job.options.withDeleted) {
        if (pagination) {
          const data = await Promise.all([
            this.model.find(where, projection, options).withDeleted(),
            this.model.countDocuments(where).withDeleted(),
          ]);
          return {
            data: data[0],
            offset: skip,
            limit,
            count: data[1],
          };
        } else {
          const data = await this.model
            .find(where, projection, options)
            .withDeleted();
          return {
            data: data,
            offset: skip,
            limit,
            count: data.length,
          };
        }
      } else {
        if (pagination) {
          const data = await Promise.all([
            this.model.find(where, projection, options),
            this.model.countDocuments(where),
          ]);
          return {
            data: data[0],
            offset: skip,
            limit,
            count: data[1],
          };
        } else {
          const data = await this.model.find(where, projection, options);
          return {
            data: data,
            offset: skip,
            limit,
            count: data.length,
          };
        }
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
  async countAllRecords(job: MongoJob): Promise<MongoCountResponse> {
    try {
      const where = job.options.where || {};
      const mongooseOptions = job.options.mongooseOptions || {};
      if (job.options.withDeleted) {
        const data = await this.model
          .countDocuments(where, mongooseOptions)
          .withDeleted();
        return { count: data };
      } else {
        const data = await this.model.countDocuments(where, mongooseOptions);
        return { count: data };
      }
    } catch (error) {
      return { error };
    }
  }

  /**
   * Find a record using model's findByPk method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findRecordById(job: MongoJob): Promise<MongoGetOneResponse<M>> {
    try {
      if (!job.id)
        return { error: 'Error calling findRecordById - id is missing' };
      const pk = job.pk;
      const where = job.options.where || {};
      const populate: any = job.options.populate || [];
      const projection = job.options.projection || undefined;
      const mongooseOptions = job.options.mongooseOptions || {};
      if (job.options.withDeleted) {
        const data = await this.model
          .findOne({ ...where, [pk]: job.id }, projection, {
            populate,
            ...mongooseOptions,
          })
          .withDeleted();
        if (data === null && !job.options.allowEmpty)
          throw new NotFoundError('Record not found');
        return { data };
      } else {
        const data = await this.model.findOne(
          { ...where, [pk]: job.id },
          projection,
          {
            populate,
            ...mongooseOptions,
          },
        );
        if (data === null && !job.options.allowEmpty)
          throw new NotFoundError('Record not found');
        return { data };
      }
    } catch (error) {
      return { error };
    }
  }

  /**
   * Find a record using model's findOne method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findOneRecord(job: MongoJob): Promise<MongoGetOneResponse<M>> {
    try {
      if (!job.options.where)
        return {
          error: 'Error calling findOneRecord - options.where is missing',
        };
      const skip = job.options.skip ? +job.options.skip : 0;
      const where = job.options.where || {};
      const populate: any = job.options.populate || [];
      const projection = job.options.projection || undefined;
      const sort = job.options.sort || [];
      const mongooseOptions = job.options.mongooseOptions || {};
      if (job.options.withDeleted) {
        const data = await this.model
          .findOne(where, projection, {
            skip,
            populate,
            sort,
            ...mongooseOptions,
          })
          .withDeleted();
        if (data === null && !job.options.allowEmpty)
          throw new NotFoundError('Record not found');
        return { data };
      } else {
        const data = await this.model.findOne(where, projection, {
          skip,
          populate,
          sort,
          ...mongooseOptions,
        });
        if (data === null && !job.options.allowEmpty)
          throw new NotFoundError('Record not found');
        return { data };
      }
    } catch (error) {
      return { error };
    }
  }

  /**
   * Add sub-document to a record
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async addSubDocument(job: MongoJob): Promise<MongoUpdateResponse<M>> {
    try {
      if (!job.id)
        return { error: 'Error calling addSubDocument - id is missing' };
      if (!job.options.subDocumentField)
        return {
          error:
            'Error calling addSubDocument - options.subDocumentField is missing',
        };
      if (!job.body)
        return { error: 'Error calling addSubDocument - body is missing' };
      const pk = job.pk;
      const where = job.options.where || {};
      const populate: any = job.options.populate || [];
      let data = await this.model.findOne({
        ...where,
        [pk]: job.id,
      });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      data[job.options.subDocumentField].push(job.body);
      if (job.owner && job.owner.id) {
        data.set('updated_by', job.owner.id);
      }
      await data.save();
      if (populate.length) {
        data = await data.populate(populate);
      }
      return { data, previousData };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Remove sub-document to a record
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async removeSubDocument(job: MongoJob): Promise<MongoUpdateResponse<M>> {
    try {
      if (!job.id)
        return { error: 'Error calling removeSubDocument - id is missing' };
      if (!job.options.subDocumentField)
        return {
          error:
            'Error calling removeSubDocument - options.subDocumentField is missing',
        };
      if (!job.options.subDocumentId)
        return {
          error:
            'Error calling removeSubDocument - options.subDocumentId is missing',
        };
      const pk = job.pk;
      const where = job.options.where || {};
      const populate: any = job.options.populate || [];
      let data = await this.model.findOne({
        ...where,
        [pk]: job.id,
      });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      data[job.options.subDocumentField].pull(job.options.subDocumentId);
      if (job.owner && job.owner.id) {
        data.set('updated_by', job.owner.id);
      }
      await data.save();
      if (populate.length) {
        data = await data.populate(populate);
      }
      return { data, previousData };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Find or create a record using model's findOne and create methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findOrCreate(job: MongoJob): Promise<MongoCreateResponse<M>> {
    try {
      if (!job.options.where)
        return {
          error: 'Error calling findOrCreate - options.where is missing',
        };
      if (!job.body)
        return { error: 'Error calling findOrCreate - body is missing' };
      if (job.owner && job.owner.id) {
        job.body.created_by = job.owner.id;
        job.body.updated_by = job.owner.id;
      }
      const where = job.options.where || {};
      const data = await this.model.findOne(where);
      let created = false;
      if (data === null) {
        const data = new this.model(job.body);
        await data.save();
        created = true;
      }

      if (this.options.history) {
        // Create history
        this.connection.models.History.create({
          entity: this.model.name,
          entity_id: data._id,
          action: 'FindOrCreate',
          created,
          data: JSON.parse(JSON.stringify(data)),
          expire_in: addDays(this.options.historyExpireIn),
        });
      }
      return { data, created };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Create or update a record using model's findOne and create methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async createOrUpdate(job: MongoJob): Promise<MongoCreateResponse<M>> {
    try {
      if (!job.options.where)
        return {
          error: 'Error calling createOrUpdate - options.where is missing',
        };
      if (!job.body)
        return {
          error: 'Error calling createOrUpdate - body is missing',
        };
      const where = job.options.where || {};
      const data = await this.model.findOne(where);
      const previousData = JSON.parse(JSON.stringify(data));
      if (data !== null) {
        if (job.owner && job.owner.id) {
          job.body.updated_by = job.owner.id;
        }
        for (const prop in job.body) {
          data[prop] = job.body[prop];
        }
        await data.save();
        if (this.options.history) {
          // Create history
          this.connection.models.History.create({
            entity: this.model.name,
            entity_id: data._id,
            action: 'CreateOrUpdate',
            data: JSON.parse(JSON.stringify(data)),
            previous_data: previousData,
            expire_in: addDays(this.options.historyExpireIn),
          });
        }
        return { data };
      } else {
        if (job.owner && job.owner.id) {
          job.body.created_by = job.owner.id;
          job.body.updated_by = job.owner.id;
        }
        const data = new this.model(job.body);
        await data.save();
        if (this.options.history) {
          // Create history
          this.connection.models.History.create({
            entity: this.model.name,
            entity_id: data._id,
            action: 'FindOrCreate',
            data: JSON.parse(JSON.stringify(data)),
            expire_in: addDays(this.options.historyExpireIn),
          });
        }
        return { data, created: true };
      }
    } catch (error) {
      return { error };
    }
  }

  /**
   * Delete a record using model's destroy method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async deleteRecord(job: MongoJob): Promise<MongoGetOneResponse<M>> {
    try {
      if (!job.id)
        return { error: 'Error calling deleteRecord - id is missing' };
      const pk = job.pk;
      const where = job.options.where || {};
      if (job.options.hardDelete) {
        const data = await this.model
          .findOne({
            ...where,
            [pk]: job.id,
          })
          .withDeleted();
        if (data === null) throw new NotFoundError('Record not found');
        await data.remove();
        // move data into trash
        this.connection.models.Trash.create({
          entity: this.model.name,
          entity_id: data._id,
          action: 'DeleteRecord',
          data: JSON.parse(JSON.stringify(data)),
          expire_in: addDays(this.options.trashExpireIn),
        });
        return { data };
      } else {
        const data = await this.model.findOne({ ...where, _id: job.id });
        if (data === null) throw new NotFoundError('Record not found');
        await data.deleteByUser(job.owner.id);
        return { data };
      }
    } catch (error) {
      return { error };
    }
  }

  /**
   * Find and delete a record using model's findOne and destroy methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async findAndDeleteRecord(job: MongoJob): Promise<MongoDeleteResponse<M>> {
    try {
      if (!job.options.where)
        return {
          error: 'Error calling findAndDeleteRecord - options.where is missing',
        };
      const where = job.options.where || {};
      if (job.options.hardDelete) {
        const data = await this.model.findOne(where).withDeleted();
        if (data === null) throw new NotFoundError('Record not found');
        await data.remove();
        this.connection.models.Trash.create({
          entity: this.model.name,
          entity_id: data._id,
          action: 'FindAndDeleteRecord',
          data: JSON.parse(JSON.stringify(data)),
          expire_in: addDays(this.options.trashExpireIn),
        });
        return { data };
      } else {
        const data = await this.model.findOne(where);
        if (data === null) throw new NotFoundError('Record not found');
        await data.deleteByUser(job.owner.id);
        return { data };
      }
    } catch (error) {
      return { error };
    }
  }

  /**
   * Delete bulk records using model's destroy methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async deleteBulkRecords(job: MongoJob): Promise<MongoResponse> {
    try {
      const where = job.options.where || {};
      if (job.options.hardDelete) {
        const data = await this.model.deleteMany(where, { force: true });
        this.connection.models.Trash.create({
          entity: this.model.name,
          action: 'DeleteBulkRecords',
          data: JSON.parse(JSON.stringify(data)),
          expire_in: addDays(this.options.trashExpireIn),
        });
        return { data };
      } else {
        const data = await this.model.deleteManyByUser(job.owner.id, where);
        return { data };
      }
    } catch (error) {
      return { error };
    }
  }

  /**
   * Restore a soft deleted record using model's restore method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async restoreRecord(job: MongoJob): Promise<MongoGetOneResponse<M>> {
    try {
      if (!job.id)
        return { error: 'Error calling restoreRecord - id is missing' };
      const data = await this.model.findById(job.id);
      if (data === null) throw new NotFoundError('Record not found');
      await data.restore();
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get aggregate results using model's aggregate method
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async aggregateRecords(job: MongoJob): Promise<MongoResponse> {
    try {
      const aggregate = job.options.aggregate || [];
      if (job.options.withDeleted) {
        const data = await this.model.aggregate(aggregate, {
          withDeleted: true,
        });
        return { data };
      } else {
        const data = await this.model.aggregate(aggregate);
        return { data };
      }
    } catch (error) {
      return { error };
    }
  }
}
