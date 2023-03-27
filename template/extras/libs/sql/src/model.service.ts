/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { DeletePayload, ReadPayload, WritePayload } from './sql.decorator';
import {
  SqlCountResponse,
  SqlCreateResponse,
  SqlDeleteResponse,
  SqlGetAllResponse,
  SqlGetOneResponse,
  SqlJob,
  SqlUpdateResponse,
} from './sql.job';
import { SqlService } from './sql.service';

export class ModelService<M> {
  public db: SqlService<M>;
  /**
   * searchFields
   * @property array of fields to include in search
   */
  searchFields: string[] = [];

  /**
   * searchPopulate
   * @property array of associations to include for search
   */
  searchPopulate: string[] = [];

  constructor(db: SqlService<M>) {
    this.db = db;
  }

  /**
   * doBeforeRead
   * @function function will execute before findById and findOne function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeRead(job: SqlJob): Promise<void> {}

  /**
   * doBeforeReadAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeReadAll(job: SqlJob): Promise<void> {}

  /**
   * doBeforeCount
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeCount(job: SqlJob): Promise<void> {}

  /**
   * doBeforeCreate
   * @function function will execute before create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeCreate(job: SqlJob): Promise<void> {}

  /**
   * doBeforeUpdate
   * @function function will execute before create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeUpdate(job: SqlJob): Promise<void> {}

  /**
   * doBeforeDelete
   * @function function will execute before delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeDelete(job: SqlJob): Promise<void> {}

  /**
   * findAll
   * @function search and get records with total count and pagination
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  @ReadPayload
  async findAll(job: SqlJob): Promise<SqlGetAllResponse<M>> {
    try {
      await this.doBeforeReadAll(job);
      if (job.error) throw job.error;
      const response = await this.db.getAllRecords(job);
      if (response.error) throw response.error;
      await this.doAfterReadAll(job, response);
      return response;
    } catch (error) {
      return { error };
    }
  }

  /**
   * getCount
   * @function search and get records with total count and pagination
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  @ReadPayload
  async getCount(job: SqlJob): Promise<SqlCountResponse> {
    try {
      await this.doBeforeCount(job);
      if (job.error) throw job.error;
      const response = await this.db.countAllRecords(job);
      if (response.error) throw response.error;
      return response;
    } catch (error) {
      return { error };
    }
  }

  /**
   * findById
   * @function get a record using primary key
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  @ReadPayload
  async findById(job: SqlJob): Promise<SqlGetOneResponse<M>> {
    try {
      await this.doBeforeRead(job);
      if (job.error) throw job.error;
      const response = await this.db.findRecordById(job);
      if (response.error) throw response.error;
      await this.doAfterRead(job, response);
      return response;
    } catch (error) {
      return { error };
    }
  }

  /**
   * findOne
   * @function search and find a record
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  @ReadPayload
  async findOne(job: SqlJob): Promise<SqlGetOneResponse<M>> {
    try {
      await this.doBeforeRead(job);
      if (job.error) throw job.error;
      const response = await this.db.findOneRecord(job);
      if (response.error) throw response.error;
      await this.doAfterRead(job, response);
      return response;
    } catch (error) {
      return { error };
    }
  }

  /**
   * create
   * @function create a new record
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  @WritePayload
  async create(job: SqlJob): Promise<SqlCreateResponse<M>> {
    try {
      await this.doBeforeCreate(job);
      if (job.error) throw job.error;
      const response = await this.db.createRecord(job);
      if (response.error) throw response.error;
      await this.doAfterCreate(job, response);
      return response;
    } catch (error) {
      return { error };
    }
  }

  /**
   * update
   * @function update a record using primary key
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  @WritePayload
  async update(job: SqlJob): Promise<SqlUpdateResponse<M>> {
    try {
      await this.doBeforeUpdate(job);
      if (job.error) throw job.error;
      const response = await this.db.updateRecord(job);
      if (response.error) throw response.error;
      await this.doAfterUpdate(job, response);
      return response;
    } catch (error) {
      return { error };
    }
  }

  /**
   * delete
   * @function delete a record using primary key
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  @DeletePayload
  async delete(job: SqlJob): Promise<SqlDeleteResponse<M>> {
    try {
      await this.doBeforeDelete(job);
      if (job.error) throw job.error;
      const response = await this.db.deleteRecord(job);
      if (response.error) throw response.error;
      await this.doAfterDelete(job, response);
      return response;
    } catch (error) {
      return { error };
    }
  }

  /**
   * doAfterRead
   * @function function will execute after findById and findOne function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  async doAfterRead(
    job: SqlJob,
    response: SqlGetOneResponse<M>,
  ): Promise<void> {}

  /**
   * doAfterReadAll
   * @function function will execute after findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  async doAfterReadAll(
    job: SqlJob,
    response: SqlGetAllResponse<M>,
  ): Promise<void> {}

  /**
   * doAfterCreate
   * @function function will execute after create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  async doAfterCreate(
    job: SqlJob,
    response: SqlCreateResponse<M>,
  ): Promise<void> {}

  /**
   * doAfterUpdate
   * @function function will execute after create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  async doAfterUpdate(
    job: SqlJob,
    response: SqlUpdateResponse<M>,
  ): Promise<void> {}

  /**
   * doAfterDelete
   * @function function will execute after delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  async doAfterDelete(
    job: SqlJob,
    response: SqlDeleteResponse<M>,
  ): Promise<void> {}
}
