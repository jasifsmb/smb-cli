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
import config from 'src/config';

type SqlOptions = FindOptions &
  CreateOptions &
  BulkCreateOptions &
  FindAndCountOptions &
  CountOptions &
  DestroyOptions &
  FindOrCreateOptions &
  FindOrBuildOptions & {
    pagination?: boolean;
    allowEmpty?: boolean;
    sideEffects?: boolean;
  };

export interface JobResponse {
  /**
   * Error object or string
   */
  error?: any;
  /**
   * Error code
   */
  errorCode?: number;
  /**
   * Response data
   */
  data?: any;
  /**
   * Response success or error message
   */
  message?: string;
  /**
   * Is created flag
   */
  created?: boolean;
  /**
   * Previous data object
   */
  previousData?: any;
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

export interface Job {
  /**
   * source app
   */
  app?: string;
  /**
   * job unique id
   */
  uid?: string;
  /**
   * user or onwer object on behave this job is running
   */
  owner?: any;
  /**
   * action performing using this job
   */
  action?: string;
  /**
   * primary key of the model
   */
  id?: number | string;
  /**
   * body object used for create or update
   */
  body?: {
    [key: string]: any;
  };
  /**
   * files object used for upload
   */
  files?: any;
  /**
   * array of records used for bulk create
   */
  records?: {
    [key: string]: any;
  }[];
  /**
   * additional parameters used in services
   */
  payload?: any;
  /**
   * Job response object
   */
  response?: JobResponse;
  /**
   * Status of the job
   *
   * @default Pending
   */
  status?: 'Pending' | 'Completed' | 'Errored';

  /**
   * parameters for sql
   */
  sql?: SqlOptions;
}

export class Job {
  constructor(job: Job) {
    this.app = job.app || config().appId;
    this.owner = job.owner || {
      id: 0,
    };
    this.uid = job.uid || null;
    this.action = job.action || null;
    this.id = job.id || null;
    this.body = job.body || null;
    this.files = job.files || {};
    this.records = job.records || [];
    this.payload = job.payload || {};
    this.response = job.response || {};
    this.status = job.status || 'Pending';
  }

  done?(res: JobResponse): void {
    this.response = res;
    this.status = !!this.response.error ? 'Errored' : 'Completed';
  }
}
