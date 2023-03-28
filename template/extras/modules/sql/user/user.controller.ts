import { SqlJob } from '@core/sql';
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
  ApiConsumes,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  ApiQueryDelete,
  ApiQueryGetAll,
  ApiQueryGetById,
  ApiQueryGetOne,
  FileUploads,
  ResponseCreated,
  ResponseDeleted,
  ResponseGetAll,
  ResponseGetOne,
  ResponseUpdated,
} from 'src/core/core.decorators';
import {
  QueryPopulate,
  ResponseForbidden,
  ResponseInternalServerError,
} from 'src/core/core.definitions';
import { NotFoundError, ValidationError } from 'src/core/core.errors';
import {
  BadRequest,
  Created,
  ErrorResponse,
  NotFound,
  Result,
} from 'src/core/core.responses';
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { Roles } from 'src/core/decorators/sql/roles.decorator';
import { Role } from '../role/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('user')
@ApiBearerAuth()
@ApiForbiddenResponse(ResponseForbidden)
@ApiInternalServerErrorResponse(ResponseInternalServerError)
@ApiExtraModels(User)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new User
   */
  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @FileUploads([{ name: 'avatar_file', required: false, bodyField: 'avatar' }])
  @ApiQuery(QueryPopulate)
  @ResponseCreated(User)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createUserDto: CreateUserDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.create(
      new SqlJob({
        owner,
        action: 'create',
        body: createUserDto,
        payload: { ...query },
      }),
    );

    if (error) {
      if (error instanceof ValidationError) {
        return BadRequest(res, {
          error,
          message: error.message,
        });
      }
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data: { user: data }, message: 'Created' });
  }

  /**
   * Update logged in user details
   */
  @Put('me')
  @ApiOperation({ summary: 'Update logged in user details' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @FileUploads([{ name: 'avatar_file', required: false, bodyField: 'avatar' }])
  @ApiQuery(QueryPopulate)
  @ResponseUpdated(User)
  async updateMe(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() updateUserDto: UpdateUserDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.update(
      new SqlJob({
        owner,
        action: 'update',
        id: owner.id,
        body: updateUserDto,
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
    return Result(res, { data: { user: data }, message: 'Updated' });
  }

  /**
   * Update a User using id
   */
  @Put(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update a user using id' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @FileUploads([{ name: 'avatar_file', required: false, bodyField: 'avatar' }])
  @ApiQuery(QueryPopulate)
  @ResponseUpdated(User)
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.update(
      new SqlJob({
        owner,
        action: 'update',
        id: +id,
        body: updateUserDto,
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
    return Result(res, { data: { user: data }, message: 'Updated' });
  }

  /**
   * Return all Users list
   */
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQueryGetAll()
  @ResponseGetAll(User)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.userService.findAll(
        new SqlJob({
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
      data: { users: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Find one User
   */
  @Get('find')
  @ApiOperation({ summary: 'Find a user' })
  @ApiQueryGetOne()
  @ResponseGetOne(User)
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.findOne(
      new SqlJob({
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
    return Result(res, { data: { user: data }, message: 'Ok' });
  }

  /**
   * Get logged in user details
   */
  @Get('me')
  @ApiOperation({ summary: 'Get logged in user details' })
  @ApiQueryGetById()
  @ResponseGetOne(User)
  async findMe(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.findById(
      new SqlJob({
        owner,
        action: 'findById',
        id: owner.id,
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
    return Result(res, { data: { user: data }, message: 'Ok' });
  }

  /**
   * Get a User by id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a user using id' })
  @ApiQueryGetById()
  @ResponseGetOne(User)
  async findById(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.findById(
      new SqlJob({
        owner,
        action: 'findById',
        id: +id,
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
    return Result(res, { data: { user: data }, message: 'Ok' });
  }

  /**
   * Delete a User using id
   */
  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a user using id' })
  @ApiQueryDelete()
  @ResponseDeleted(User)
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.userService.delete(
      new SqlJob({
        owner,
        action: 'delete',
        id: +id,
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
    return Result(res, { data: { user: data }, message: 'Deleted' });
  }
}
