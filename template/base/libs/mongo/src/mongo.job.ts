import { AggregateOptions, PipelineStage, QueryOptions, Types } from 'mongoose';
import { Job, JobResponse } from 'src/core/core.job';
import { ModelWrap } from './mongo.service';

export interface MongoOptions extends QueryOptions {
  /**
   * Where conditions
   */
  where?: any;
  /**
   * Enable pagination, default is false
   * @default false
   */
  pagination?: boolean;
  /**
   * Get response even if record not found, by default false and it throws an error if record not found
   * @default false
   */
  allowEmpty?: boolean;
  /**
   * Retrieve records including deleted records, default is false
   * @default false
   */
  withDeleted?: boolean;
  /**
   * Hard delete record, default is false (soft delete)
   * @default false
   */
  hardDelete?: boolean;
  /**
   * Sub-documents (array) field name
   */
  subDocumentField?: string;
  /**
   * Sub-document id
   */
  subDocumentId?: string | Types.ObjectId;
  /**
   * Aggregate pipelines
   */
  aggregate?: PipelineStage[];
  /**
   * Aggregate options
   */
  aggregateOptions?: AggregateOptions;
  /**
   * Other mongoose options
   */
  mongooseOptions?: any;
}

export interface MongoResponse<T = any> extends JobResponse {
  /**
   * Response data
   */
  data?: T;
}

export interface MongoCountResponse extends JobResponse {
  /**
   * Total available records count
   */
  count?: number;
}

export interface MongoGetOneResponse<T> extends JobResponse {
  /**
   * Response data
   */
  data?: ModelWrap<T>;
}

export interface MongoGetAllResponse<T> extends JobResponse {
  /**
   * Response data
   */
  data?: ModelWrap<T>[];
  /**
   * Offset for pagination
   */
  offset?: number;
  /**
   * Limit for pagination
   */
  limit?: number;
  /**
   * Total available records count
   */
  count?: number;
}

export interface MongoCreateResponse<T> extends MongoGetOneResponse<T> {
  /**
   * Is created flag
   */
  created?: boolean;
}

export interface MongoUpdateResponse<T> extends MongoGetOneResponse<T> {
  /**
   * Previous data object
   */
  previousData?: ModelWrap<T>;
}

export interface MongoDeleteResponse<T> extends JobResponse {
  /**
   * Response data
   */
  data?: ModelWrap<T>;
}

export interface MongoCreateBulkResponse<T> extends JobResponse {
  /**
   * Response data
   */
  data?: ModelWrap<T>[];
}

export interface MongoJob<T = any> extends Job {
  /**
   * primary key name of the model
   */
  pk?: string;
  /**
   * primary key value of the model
   */
  id?: number | string;
  /**
   * body object used for create or update
   */
  body?: Partial<T> & {
    [key: string]: any;
  };
  /**
   * array of records used for bulk create
   */
  records?: {
    [key: string]: any;
  }[];
  /**
   * parameters for mongo
   */
  options?: MongoOptions;
}

export class MongoJob<T = any> extends Job {
  constructor(job: MongoJob<T>) {
    super(job);
    this.pk = job.pk || '_id';
    this.id = job.id || null;
    this.body = job.body || {};
    this.records = job.records || [];
    this.options = job.options || {};
  }
}
