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
import { Owner, OwnerDto } from 'src/core/decorators/sql/owner.decorator';
import { Roles } from 'src/core/decorators/sql/roles.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role as RoleModel } from './entities/role.entity';
import { Role } from './role.enum';
import { RoleService } from './role.service';

@ApiTags('role')
@ApiBearerAuth()
@ApiForbiddenResponse(ResponseForbidden)
@ApiInternalServerErrorResponse(ResponseInternalServerError)
@ApiExtraModels(RoleModel)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Create a new Role
   */
  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new role' })
  @ResponseCreated(RoleModel)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    const { error, data } = await this.roleService.create(
      new SqlJob({
        owner,
        action: 'create',
        body: createRoleDto,
      }),
    );

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data: { role: data }, message: 'Created' });
  }

  /**
   * Update a Role using id
   */
  @Put(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update a role using id' })
  @ResponseUpdated(RoleModel)
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const { error, data } = await this.roleService.update(
      new SqlJob({
        owner,
        action: 'update',
        id: +id,
        body: updateRoleDto,
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
    return Result(res, { data: { role: data }, message: 'Updated' });
  }

  /**
   * Return all Roles list
   */
  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiQueryGetAll()
  @ResponseGetAll(RoleModel)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.roleService.findAll(
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
      data: { roles: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Find one Role
   */
  @Get('find')
  @ApiOperation({ summary: 'Find a role' })
  @ApiQueryGetOne()
  @ResponseGetOne(RoleModel)
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.roleService.findOne(
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
    return Result(res, { data: { role: data }, message: 'Ok' });
  }

  /**
   * Get a Role by id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a role using id' })
  @ApiQueryGetById()
  @ResponseGetOne(RoleModel)
  async findById(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.roleService.findById(
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
    return Result(res, { data: { role: data }, message: 'Ok' });
  }

  /**
   * Delete a Role using id
   */
  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a role using id' })
  @ApiQueryDelete()
  @ResponseDeleted(RoleModel)
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.roleService.delete(
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
    return Result(res, { data: { role: data }, message: 'Deleted' });
  }
}
