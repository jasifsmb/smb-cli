/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { DeletePayload, ReadPayload, WritePayload } from './mongo.decorator';
import {
  MongoCountResponse,
  MongoCreateResponse,
  MongoDeleteResponse,
  MongoGetAllResponse,
  MongoGetOneResponse,
  MongoJob,
  MongoUpdateResponse,
} from './mongo.job';
import { MongoService } from './mongo.service';

export class ModelService<M> {
  public db: MongoService<M>;
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

  constructor(_db: MongoService<M>) {
    this.db = _db;
  }

  /**
   * doBeforeRead
   * @function function will execute before findById and findOne function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeRead(job: MongoJob<M>): Promise<void> {}

  /**
   * doBeforeReadAll
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeReadAll(job: MongoJob<M>): Promise<void> {}

  /**
   * doBeforeCount
   * @function function will execute before findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeCount(job: MongoJob<M>): Promise<void> {}

  /**
   * doBeforeCreate
   * @function function will execute before create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeCreate(job: MongoJob<M>): Promise<void> {}

  /**
   * doBeforeUpdate
   * @function function will execute before create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeUpdate(job: MongoJob<M>): Promise<void> {}

  /**
   * doBeforeDelete
   * @function function will execute before delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeDelete(job: MongoJob<M>): Promise<void> {}

  /**
   * findAll
   * @function search and get records with total count and pagination
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  @ReadPayload
  async findAll(job: MongoJob<M>): Promise<MongoGetAllResponse<M>> {
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
  async getCount(job: MongoJob<M>): Promise<MongoCountResponse> {
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
  async findById(job: MongoJob<M>): Promise<MongoGetOneResponse<M>> {
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
  async findOne(job: MongoJob<M>): Promise<MongoGetOneResponse<M>> {
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
  async create(job: MongoJob<M>): Promise<MongoCreateResponse<M>> {
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
  async update(job: MongoJob<M>): Promise<MongoUpdateResponse<M>> {
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
  async delete(job: MongoJob<M>): Promise<MongoDeleteResponse<M>> {
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
    job: MongoJob,
    response: MongoGetOneResponse<M>,
  ): Promise<void> {}

  /**
   * doAfterReadAll
   * @function function will execute after findAll function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  async doAfterReadAll(
    job: MongoJob,
    response: MongoGetAllResponse<M>,
  ): Promise<void> {}

  /**
   * doAfterCreate
   * @function function will execute after create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  async doAfterCreate(
    job: MongoJob,
    response: MongoCreateResponse<M>,
  ): Promise<void> {}

  /**
   * doAfterUpdate
   * @function function will execute after create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  async doAfterUpdate(
    job: MongoJob,
    response: MongoUpdateResponse<M>,
  ): Promise<void> {}

  /**
   * doAfterDelete
   * @function function will execute after delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @param {object} response - mandatory - a object representing the job response information
   * @return {void}
   */
  async doAfterDelete(
    job: MongoJob,
    response: MongoDeleteResponse<M>,
  ): Promise<void> {}
}
