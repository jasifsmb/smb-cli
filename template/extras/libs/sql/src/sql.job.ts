import {
  BulkCreateOptions,
  CountOptions,
  CreateOptions,
  DestroyOptions,
  FindAndCountOptions,
  FindOptions,
  FindOrBuildOptions,
  FindOrCreateOptions,
} from 'sequelize';
import { Job, JobResponse } from 'src/core/core.job';
import { ModelWrap } from './sql.service';

export type SqlJobOptions = FindOptions &
  CreateOptions &
  BulkCreateOptions &
  FindAndCountOptions &
  CountOptions &
  DestroyOptions &
  FindOrCreateOptions &
  FindOrBuildOptions & {
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
     * Other sequelize options
     */
    sequelizeOptions?: any;
  };

export interface SqlResponse<T = any> extends JobResponse {
  /**
   * Response data
   */
  data?: T;
}

export interface SqlCountResponse extends JobResponse {
  /**
   * Total available records count
   */
  count?: number;
}

export interface SqlGetOneResponse<T> extends JobResponse {
  /**
   * Response data
   */
  data?: ModelWrap<T>;
}

export interface SqlGetAllResponse<T> extends JobResponse {
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

export interface SqlCreateResponse<T> extends SqlGetOneResponse<T> {
  /**
   * Is created flag
   */
  created?: boolean;
}

export interface SqlUpdateResponse<T> extends SqlGetOneResponse<T> {
  /**
   * Previous data object
   */
  previousData?: ModelWrap<T>;
}

export interface SqlDeleteResponse<T> extends JobResponse {
  /**
   * Response data
   */
  data?: ModelWrap<T>;
}

export interface SqlCreateBulkResponse<T> extends JobResponse {
  /**
   * Response data
   */
  data?: ModelWrap<T>[];
}

export interface SqlJob<T = any> extends Job {
  /**
   * primary key name of the model
   */
  pk?: string;
  /**
   * primary key value of the model
   */
  id?: number;
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
   * parameters for sql
   */
  options?: SqlJobOptions;
}

export class SqlJob<T = any> extends Job {
  constructor(job: SqlJob<T>) {
    super(job);
    this.pk = job.pk || 'id';
    this.id = job.id || null;
    this.body = job.body || {};
    this.records = job.records || [];
    this.options = job.options || {};
  }
}
