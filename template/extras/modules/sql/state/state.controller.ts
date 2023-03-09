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
import { Job } from 'src/core/core.job';
import {
  Created,
  ErrorResponse,
  NotFound,
  Result,
} from 'src/core/core.responses';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
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
      new Job({
        owner,
        action: 'create',
        body: createStateDto,
      }),
    );

    if (!!error) {
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
    @Param('id') id: number,
    @Body() updateStateDto: UpdateStateDto,
  ) {
    const { error, data } = await this.stateService.update(
      new Job({
        owner,
        action: 'update',
        id: +id,
        body: updateStateDto,
      }),
    );

    if (!!error) {
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
        new Job({
          owner,
          action: 'findAll',
          payload: { ...query },
        }),
      );

    if (!!error) {
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
      new Job({
        owner,
        action: 'findOne',
        payload: { ...query },
      }),
    );

    if (!!error) {
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
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.stateService.findById(
      new Job({
        owner,
        action: 'findById',
        id: +id,
        payload: { ...query },
      }),
    );

    if (!!error) {
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
  @ResponseDeleted(State)
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
  ) {
    const { error, data } = await this.stateService.delete(
      new Job({
        owner,
        action: 'delete',
        id: +id,
      }),
    );

    if (!!error) {
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
