import { MongoJob } from '@core/mongo';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  ApiQueryDelete,
  ApiQueryGetAll,
  ApiQueryGetById,
  ApiQueryGetOne,
  ResponseCreated,
  ResponseDeleted,
  ResponseGetAll,
  ResponseGetOne,
  ResponseUpdated,
} from 'src/core/core.decorators';
import {
  ResponseForbidden,
  ResponseInternalServerError,
} from 'src/core/core.definitions';
import { NotFoundError } from 'src/core/core.errors';
import {
  Created,
  ErrorResponse,
  NotFound,
  Result,
} from 'src/core/core.responses';
import { Owner, OwnerDto } from 'src/core/decorators/mongo/owner.decorator';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { State } from './entities/state.entity';
import { StateService } from './state.service';

@ApiTags('state')
@ApiBearerAuth()
@ApiForbiddenResponse(ResponseForbidden)
@ApiInternalServerErrorResponse(ResponseInternalServerError)
@ApiExtraModels(State)
@Controller('state')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  /**
   * Create a new State
   */
  @Post()
  @ApiOperation({ summary: 'Create a new state' })
  @ResponseCreated(State)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createStateDto: CreateStateDto,
  ) {
    const { error, data } = await this.stateService.create(
      new MongoJob({
        owner,
        action: 'create',
        body: createStateDto,
      }),
    );

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data: { state: data }, message: 'Created' });
  }

  /**
   * Update a State using id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a state using id' })
  @ResponseUpdated(State)
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: string,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    const { error, data } = await this.stateService.update(
      new MongoJob({
        owner,
        action: 'update',
        id,
        body: updateStateDto,
      }),
    );

    if (error) {
      if (error instanceof NotFoundError) {
        return NotFound(res, {
          error,
          message: `Record not found`,
        });
      }
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, { data: { state: data }, message: 'Updated' });
  }

  /**
   * Return all States list
   */
  @Get()
  @ApiOperation({ summary: 'Get all states' })
  @ApiQueryGetAll()
  @ResponseGetAll(State)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.stateService.findAll(
        new MongoJob({
          owner,
          action: 'findAll',
          payload: { ...query },
        }),
      );

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, {
      data: { states: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Find one State
   */
  @Get('find')
  @ApiOperation({ summary: 'Find a state' })
  @ApiQueryGetOne()
  @ResponseGetOne(State)
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.stateService.findOne(
      new MongoJob({
        owner,
        action: 'findOne',
        payload: { ...query },
      }),
    );

    if (error) {
      if (error instanceof NotFoundError) {
        return NotFound(res, {
          error,
          message: `Record not found`,
        });
      }
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, { data: { state: data }, message: 'Ok' });
  }

  /**
   * Get a State by id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a state using id' })
  @ApiQueryGetById()
  @ResponseGetOne(State)
  async findById(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: string,
    @Query() query: any,
  ) {
    const { error, data } = await this.stateService.findById(
      new MongoJob({
        owner,
        action: 'findById',
        id,
        payload: { ...query },
      }),
    );

    if (error) {
      if (error instanceof NotFoundError) {
        return NotFound(res, {
          error,
          message: `Record not found`,
        });
      }
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, { data: { state: data }, message: 'Ok' });
  }

  /**
   * Delete a State using id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a state using id' })
  @ApiQueryDelete()
  @ResponseDeleted(State)
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: string,
    @Query() query: any,
  ) {
    const { error, data } = await this.stateService.delete(
      new MongoJob({
        owner,
        action: 'delete',
        id,
        payload: { ...query },
      }),
    );

    if (error) {
      if (error instanceof NotFoundError) {
        return NotFound(res, {
          error,
          message: `Record not found`,
        });
      }
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Result(res, { data: { state: data }, message: 'Deleted' });
  }
}