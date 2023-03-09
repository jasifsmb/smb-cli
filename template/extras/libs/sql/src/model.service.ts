import { Job, JobResponse } from 'src/core/core.job';
import { DeletePayload, ReadPayload, WritePayload } from './sql.decorator';
import { ModelType, SqlService } from './sql.service';

export abstract class ModelService extends SqlService {
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

  constructor(model: ModelType<any>) {
    super(model);
  }

  /**
   * doBeforeRead
   * @function function will execute before findAll, findById and findOne function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeRead(job: Job): Promise<void> {
    job.response.error = false;
  }

  /**
   * doBeforeWrite
   * @function function will execute before create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeWrite(job: Job): Promise<void> {
    job.response.error = false;
  }

  /**
   * doBeforeDelete
   * @function function will execute before delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doBeforeDelete(job: Job): Promise<void> {
    job.response.error = false;
  }

  /**
   * findAll
   * @function search and get records with total count and pagination
   * @param {object} job - mandatory - a job object representing the job information
   * @return {object} job response object
   */
  @ReadPayload
  async findAll(job: Job): Promise<JobResponse> {
    try {
      await this.doBeforeRead(job);
      if (!!job.response.error) return job.response;
      job.response = await this.getAllRecords(job);
      if (!!job.response.error) return job.response;
      await this.doAfterRead(job);
      return job.response;
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
  async getCount(job: Job): Promise<JobResponse> {
    try {
      await this.doBeforeRead(job);
      if (!!job.response.error) return job.response;
      job.response = await this.countAllRecords(job);
      if (!!job.response.error) return job.response;
      await this.doAfterRead(job);
      return job.response;
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
  async findById(job: Job): Promise<JobResponse> {
    try {
      await this.doBeforeRead(job);
      if (!!job.response.error) return job.response;
      job.response = await this.findRecordById(job);
      if (!!job.response.error) return job.response;
      await this.doAfterRead(job);
      return job.response;
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
  async findOne(job: Job): Promise<JobResponse> {
    try {
      await this.doBeforeRead(job);
      if (!!job.response.error) return job.response;
      job.response = await this.findOneRecord(job);
      if (!!job.response.error) return job.response;
      await this.doAfterRead(job);
      return job.response;
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
  async create(job: Job): Promise<JobResponse> {
    try {
      await this.doBeforeWrite(job);
      if (!!job.response.error) return job.response;
      job.response = await this.createRecord(job);
      if (!!job.response.error) return job.response;
      await this.doAfterWrite(job);
      return job.response;
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
  async update(job: Job): Promise<JobResponse> {
    try {
      await this.doBeforeWrite(job);
      if (!!job.response.error) return job.response;
      job.response = await this.updateRecord(job);
      if (!!job.response.error) return job.response;
      await this.doAfterWrite(job);
      return job.response;
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
  async delete(job: Job): Promise<JobResponse> {
    try {
      await this.doBeforeDelete(job);
      if (!!job.response.error) return job.response;
      job.response = await this.deleteRecord(job);
      if (!!job.response.error) return job.response;
      await this.doAfterDelete(job);
      return job.response;
    } catch (error) {
      return { error };
    }
  }

  /**
   * doAfterRead
   * @function function will execute after findAll, findById and findOne function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doAfterRead(job: Job): Promise<void> {
    job.status = !!job.response.error ? 'Errored' : 'Completed';
  }

  /**
   * doAfterWrite
   * @function function will execute after create and update function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doAfterWrite(job: Job): Promise<void> {
    job.status = !!job.response.error ? 'Errored' : 'Completed';
  }

  /**
   * doAfterDelete
   * @function function will execute after delete function
   * @param {object} job - mandatory - a job object representing the job information
   * @return {void}
   */
  async doAfterDelete(job: Job): Promise<void> {
    job.status = !!job.response.error ? 'Errored' : 'Completed';
  }
}
