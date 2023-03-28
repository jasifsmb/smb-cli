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
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';

@ApiTags('country')
@ApiBearerAuth()
@ApiForbiddenResponse(ResponseForbidden)
@ApiInternalServerErrorResponse(ResponseInternalServerError)
@ApiExtraModels(Country)
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  /**
   * Create a new Country
   */
  @Post()
  @ApiOperation({ summary: 'Create a new country' })
  @ResponseCreated(Country)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Body() createCountryDto: CreateCountryDto,
  ) {
    const { error, data } = await this.countryService.create(
      new SqlJob({
        owner,
        action: 'create',
        body: createCountryDto,
      }),
    );

    if (error) {
      return ErrorResponse(res, {
        error,
        message: `${error.message || error}`,
      });
    }
    return Created(res, { data: { country: data }, message: 'Created' });
  }

  /**
   * Update a Country using id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a country using id' })
  @ResponseUpdated(Country)
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    const { error, data } = await this.countryService.update(
      new SqlJob({
        owner,
        action: 'update',
        id: +id,
        body: updateCountryDto,
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
    return Result(res, { data: { country: data }, message: 'Updated' });
  }

  /**
   * Return all Countries list
   */
  @Get()
  @ApiOperation({ summary: 'Get all countries' })
  @ApiQueryGetAll()
  @ResponseGetAll(Country)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data, offset, limit, count } =
      await this.countryService.findAll(
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
      data: { countries: data, offset, limit, count },
      message: 'Ok',
    });
  }

  /**
   * Find one Country
   */
  @Get('find')
  @ApiOperation({ summary: 'Find a country' })
  @ApiQueryGetOne()
  @ResponseGetOne(Country)
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Query() query: any,
  ) {
    const { error, data } = await this.countryService.findOne(
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
    return Result(res, { data: { country: data }, message: 'Ok' });
  }

  /**
   * Get a Country by id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a country using id' })
  @ApiQueryGetById()
  @ResponseGetOne(Country)
  async findById(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.countryService.findById(
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
    return Result(res, { data: { country: data }, message: 'Ok' });
  }

  /**
   * Delete a Country using id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a country using id' })
  @ApiQueryDelete()
  @ResponseDeleted(Country)
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Owner() owner: OwnerDto,
    @Param('id') id: number,
    @Query() query: any,
  ) {
    const { error, data } = await this.countryService.delete(
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
    return Result(res, { data: { country: data }, message: 'Deleted' });
  }
}
