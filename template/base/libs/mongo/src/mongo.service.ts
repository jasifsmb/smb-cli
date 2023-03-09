import { isArray } from 'class-validator';
import { Model } from 'mongoose';
import { NotFoundError } from 'src/core/core.errors';
import { Job, JobResponse } from 'src/core/core.job';
// import config from '../../../config';

export abstract class MongoService {
  constructor(private model: Model<any>) {}

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
      const populate = job.mongo.populate || [];
      let data = new this.model(job.body);
      await data.save();
      if (!!populate) {
        data = await data.populate(populate);
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
      const data = await this.model.create(job.records);
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
      const where = job.mongo.where || {};
      const populate: any = job.mongo.populate || [];
      let data = await this.model.findOne({
        ...where,
        _id: job.id,
        deleted_at: null,
      });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      for (const prop in job.body) {
        data[prop] = job.body[prop];
      }
      await data.save();
      if (!!populate.length) {
        data = await data.populate(populate);
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
  async findAndUpdateRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.mongo?.where)
        return {
          error: 'Error calling findAndUpdateRecord - options.where is missing',
        };
      if (!job.body)
        return { error: 'Error calling findAndUpdateRecord - body is missing' };
      if (!!job.owner && !!job.owner.id) {
        job.body.updated_by = job.owner.id;
      }
      const where = job.mongo.where || undefined;
      const data = await this.model.findOne({ ...where, deleted_at: null });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      for (const prop in job.body) {
        data[prop] = job.body[prop];
      }
      await data.save();
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
      const where = job.mongo.where || undefined;
      const data = await this.model.updateMany(
        { ...where, deleted_at: null },
        job.body,
      );
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
  async getAllRecords(job: Job): Promise<JobResponse> {
    try {
      const offset = job.mongo.offset ? +job.mongo.offset : 0;
      const limit = job.mongo.limit;
      const where = job.mongo.where || {};
      const populate: any = job.mongo.populate || [];
      const projection = job.mongo.attributes || undefined;
      const sort = job.mongo.sort || [];
      const pagination = job.mongo.pagination ?? true;
      const mongooseOptions = job.mongo.mongooseOptions || {};
      if (!job.mongo.withDeleted) {
        where.deleted_at = null;
      }
      const options = {
        skip: offset,
        limit,
        populate,
        sort,
        ...mongooseOptions,
      };
      if (pagination) {
        const data = await Promise.all([
          this.model.find(where, projection, options),
          this.model.countDocuments(where),
        ]);
        return { data: data[0], offset, limit, count: data[1] };
      } else {
        const data = await this.model.find(where, projection, options);
        return { data, offset, limit, count: data.length };
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
      const where = job.mongo.where || {};
      const mongooseOptions = job.mongo.mongooseOptions || {};
      if (!job.mongo.withDeleted) {
        where.deleted_at = null;
      }
      const data = await this.model.countDocuments(where, mongooseOptions);
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
      const where = job.mongo.where || {};
      const populate: any = job.mongo.populate || [];
      const projection = job.mongo.attributes || undefined;
      const mongooseOptions = job.mongo.mongooseOptions || {};
      if (!job.mongo.withDeleted) {
        where.deleted_at = null;
      }
      const data = await this.model.findOne(
        { ...where, _id: job.id },
        projection,
        {
          populate,
          ...mongooseOptions,
        },
      );
      if (data === null && !job.mongo?.allowEmpty)
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
      if (!job.mongo.where)
        return {
          error: 'Error calling findOneRecord - options.where is missing',
        };
      const offset = job.mongo.offset ? +job.mongo.offset : 0;
      const where = job.mongo.where || {};
      const populate: any = job.mongo.populate || [];
      const projection = job.mongo.attributes || undefined;
      const sort = job.mongo.sort || [];
      const mongooseOptions = job.mongo.mongooseOptions || {};
      if (!job.mongo.withDeleted) {
        where.deleted_at = null;
      }
      const data = await this.model.findOne(where, projection, {
        skip: offset,
        populate,
        sort,
        ...mongooseOptions,
      });
      if (data === null && !job.mongo?.allowEmpty)
        throw new NotFoundError('Record not found');
      return { data };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Add sub-document to a record
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async addSubDocument(job: Job): Promise<JobResponse> {
    try {
      if (!job.id)
        return { error: 'Error calling addSubDocument - id is missing' };
      if (!job.mongo.subDocumentField)
        return {
          error:
            'Error calling addSubDocument - options.subDocumentField is missing',
        };
      if (!job.body)
        return { error: 'Error calling addSubDocument - body is missing' };
      const where = job.mongo.where || {};
      const populate: any = job.mongo.populate || [];
      let data = await this.model.findOne({
        ...where,
        _id: job.id,
        deleted_at: null,
      });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      data[job.mongo.subDocumentField].push(job.body);
      if (!!job.owner && !!job.owner.id) {
        data.updated_by = job.owner.id;
      }
      await data.save();
      if (!!populate.length) {
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
  async removeSubDocument(job: Job): Promise<JobResponse> {
    try {
      if (!job.id)
        return { error: 'Error calling removeSubDocument - id is missing' };
      if (!job.mongo.subDocumentField)
        return {
          error:
            'Error calling removeSubDocument - options.subDocumentField is missing',
        };
      if (!job.mongo.subDocumentId)
        return {
          error:
            'Error calling removeSubDocument - options.subDocumentId is missing',
        };
      const where = job.mongo.where || {};
      const populate: any = job.mongo.populate || [];
      let data = await this.model.findOne({
        ...where,
        _id: job.id,
        deleted_at: null,
      });
      if (data === null) throw new NotFoundError('Record not found');
      const previousData = JSON.parse(JSON.stringify(data));
      data[job.mongo.subDocumentField].pull(job.mongo.subDocumentId);
      if (!!job.owner && !!job.owner.id) {
        data.updated_by = job.owner.id;
      }
      await data.save();
      if (!!populate.length) {
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
  async findOrCreate(job: Job): Promise<JobResponse> {
    try {
      if (!job.mongo?.where)
        return {
          error: 'Error calling findOrCreate - options.where is missing',
        };
      if (!job.body)
        return { error: 'Error calling findOrCreate - body is missing' };
      if (!!job.owner && !!job.owner.id) {
        job.body.created_by = job.owner.id;
        job.body.updated_by = job.owner.id;
      }
      const where = job.mongo.where || {};
      const data = await this.model.findOne(where);
      if (data !== null) return { data };
      else {
        const data = new this.model(job.body);
        await data.save();
        return { data };
      }
    } catch (error) {
      return { error };
    }
  }

  /**
   * Create or update a record using model's findOne and create methods
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  async createOrUpdate(job: Job): Promise<JobResponse> {
    try {
      if (!job.mongo?.where)
        return {
          error: 'Error calling createOrUpdate - options.where is missing',
        };
      if (!job.body)
        return {
          error: 'Error calling createOrUpdate - body is missing',
        };
      const where = job.mongo.where || {};
      const data = await this.model.findOne(where);
      if (data !== null) {
        if (!!job.owner && !!job.owner.id) {
          job.body.updated_by = job.owner.id;
        }
        for (const prop in job.body) {
          data[prop] = job.body[prop];
        }
        await data.save();
        return { data };
      } else {
        if (!!job.owner && !!job.owner.id) {
          job.body.created_by = job.owner.id;
          job.body.updated_by = job.owner.id;
        }
        const data = new this.model(job.body);
        await data.save();
        return { data };
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
  async deleteRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.id)
        return { error: 'Error calling deleteRecord - id is missing' };
      const where = job.mongo.where || {};
      if (!job.mongo.hardDelete) {
        where.deleted_at = null;
      }
      const data = await this.model.findOne({ ...where, _id: job.id });
      if (data === null) throw new NotFoundError('Record not found');
      if (!!job.mongo.hardDelete) {
        await data.remove();
      } else {
        if (!!job.owner && !!job.owner.id) {
          data.updated_by = job.owner.id;
        }
        data.deleted_at = Date.now();
        await data.save();
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
  async findAndDeleteRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.mongo?.where)
        return {
          error: 'Error calling findAndDeleteRecord - options.where is missing',
        };
      const where = job.mongo.where || {};
      if (!job.mongo.hardDelete) {
        where.deleted_at = null;
      }
      const data = await this.model.findOne(where);
      if (data === null) throw new NotFoundError('Record not found');
      if (!!job.mongo.hardDelete) {
        await data.remove();
      } else {
        if (!!job.owner && !!job.owner.id) {
          data.updated_by = job.owner.id;
        }
        data.deleted_at = Date.now();
        await data.save();
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
  async deleteBulkRecords(job: Job): Promise<JobResponse> {
    try {
      const where = job.mongo.where || {};
      if (!!job.mongo.hardDelete) {
        const data = await this.model.deleteMany(where);
        return { data };
      } else {
        const body: any = {
          deleted_at: Date.now(),
        };
        if (!!job.owner && !!job.owner.id) {
          body.updated_by = job.owner.id;
        }
        const data = await this.model.updateMany(where, body);
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
  async restoreRecord(job: Job): Promise<JobResponse> {
    try {
      if (!job.id)
        return { error: 'Error calling restoreRecord - id is missing' };
      const data = await this.model.findById(job.id);
      if (data === null) throw new NotFoundError('Record not found');
      if (!!job.owner && !!job.owner.id) {
        data.updated_by = job.owner.id;
      }
      data.deleted_at = null;
      await data.save();
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
  async aggregateRecords(job: Job): Promise<JobResponse> {
    try {
      const aggregate = job.mongo.aggregate || [];
      if (!job.mongo.withDeleted) {
        const aggregateMatch = aggregate.find((x) =>
          x.hasOwnProperty('$match'),
        );
        if (!!aggregateMatch) {
          aggregateMatch.$match.deleted_at = null;
        }
      }
      const data = await this.model.aggregate(aggregate);
      return { data: data };
    } catch (error) {
      return { error };
    }
  }
}
