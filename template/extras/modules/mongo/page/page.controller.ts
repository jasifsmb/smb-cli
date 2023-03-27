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
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { Roles } from 'src/core/decorators/mongo/roles.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { Role } from '../role/role.enum';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page } from './entities/page.entity';
import { PageService } from './page.service';

@ApiTags('page')
@ApiBearerAuth()
@ApiForbiddenResponse(ResponseForbidden)
@ApiInternalServerErrorResponse(ResponseInternalServerError)
@ApiExtraModels(Page)
@Controller('page')
export class PageController {
  constructor(
    private readonly pageService: PageService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new CMS page
   */
  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new page' })
  @ResponseCreated(Page)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createPageDto: CreatePageDto,
  ) {
    const { error, data } = await this.pageService.create(
      new MongoJob({
        owner,
        action: 'create',
        body: createPageDto,
      }),
    );

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data: { page: data }, message: 'Created' });
  }

  /**
   * Update a CMS page using id
   */
  @Put(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update a page using id' })
  @ResponseUpdated(Page)
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    const { error, data } = await this.pageService.update(
      new MongoJob({
        owner,
        action: 'update',
        id,
        body: updatePageDto,
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
    return Result(res, { data: { page: data }, message: 'Updated' });
  }

  /**
   * Return all CMS pages list
   */
  @Get()
  @ApiOperation({ summary: 'Get all pages' })
  @ApiQueryGetAll()
  @ResponseGetAll(Page)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.pageService.findAll(
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
      data: { pages: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Find one CMS page
   */
  @Get('find')
  @ApiOperation({ summary: 'Find a page' })
  @ApiQueryGetOne()
  @ResponseGetOne(Page)
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.pageService.findOne(
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
    return Result(res, { data: { page: data }, message: 'Ok' });
  }

  /**
   * Get a CMS page by id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a page using id' })
  @ApiQueryGetById()
  @ResponseGetOne(Page)
  async findById(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: string,
    @Query() query: any,
  ) {
    const { error, data } = await this.pageService.findById(
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
    return Result(res, { data: { page: data }, message: 'Ok' });
  }

  /**
   * Delete a CMS page using id
   */
  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a page using id' })
  @ApiQueryDelete()
  @ResponseDeleted(Page)
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: string,
    @Query() query: any,
  ) {
    const { error, data } = await this.pageService.delete(
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
    return Result(res, { data: { page: data }, message: 'Deleted' });
  }

  @Get(':name/webview')
  @Public()
  @Render('page')
  async webview(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('name') name: string,
  ) {
    const { error, data } = await this.pageService.findOne(
      new MongoJob({
        owner,
        action: 'findOne',
        payload: {
          where: {
            name,
          },
        },
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
    return {
      app_name: this.configService.get('appName'),
      ...data.toJSON(),
    };
  }
}
