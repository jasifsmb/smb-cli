import {
  applyDecorators,
  Type,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { CDNStorage } from 'src/config';
import { MsGuard } from 'src/core/guards/ms.quard';
import {
  QueryDeleteMode,
  QueryLimit,
  QueryOffset,
  QueryPopulate,
  QuerySearch,
  QuerySelect,
  QuerySort,
  QueryWhere,
} from './core.definitions';
import { pluralizeString, snakeCase } from './core.utils';
import { UploadInterceptor } from './interceptors/upload.interceptors';

export const ApiQueryGetAll = () => {
  return applyDecorators(
    ApiQuery(QueryOffset),
    ApiQuery(QueryLimit),
    ApiQuery(QuerySearch),
    ApiQuery(QuerySelect),
    ApiQuery(QueryWhere),
    ApiQuery(QueryPopulate),
    ApiQuery(QuerySort),
  );
};

export const ApiQueryCountAll = () => {
  return applyDecorators(
    ApiQuery(QuerySearch),
    ApiQuery(QueryWhere),
    ApiQuery(QueryPopulate),
  );
};

export const ApiQueryGetOne = () => {
  return applyDecorators(
    ApiQuery(QueryOffset),
    ApiQuery(QuerySearch),
    ApiQuery(QuerySelect),
    ApiQuery(QueryWhere),
    ApiQuery(QueryPopulate),
    ApiQuery(QuerySort),
  );
};

export const ApiQueryGetById = () => {
  return applyDecorators(ApiQuery(QuerySelect), ApiQuery(QueryPopulate));
};

export const ApiQueryDelete = () => {
  return applyDecorators(ApiQuery(QueryDeleteMode));
};

export const ResponseGetAll = <TModel extends Type<any>>(
  model: TModel,
  collection?: string,
) => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Ok',
      schema: {
        properties: {
          data: {
            type: 'object',
            properties: {
              offset: {
                type: 'number',
                description: 'No of records to skip',
                example: 0,
              },
              limit: {
                type: 'number',
                description: 'No of records to take',
                example: 10,
              },
              count: {
                type: 'number',
                description: 'Total no of records available',
                example: 10,
              },
              [collection || pluralizeString(snakeCase(model.name))]: {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model),
                },
              },
            },
          },
          message: {
            type: 'string',
            example: 'Ok',
          },
        },
      },
    }),
  );
};

export const ResponseCountAll = () => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Ok',
      schema: {
        properties: {
          data: {
            type: 'object',
            properties: {
              count: {
                type: 'number',
                description: 'Total no of records available',
                example: 10,
              },
            },
          },
          message: {
            type: 'string',
            example: 'Ok',
          },
        },
      },
    }),
  );
};

export const ResponseCreated = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiCreatedResponse({
      description: 'Created',
      schema: {
        properties: {
          data: {
            type: 'object',
            properties: {
              [snakeCase(model.name)]: {
                $ref: getSchemaPath(model),
              },
            },
          },
          message: {
            type: 'string',
            example: 'Created',
          },
        },
      },
    }),
  );
};

export const ResponseUpdated = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Updated',
      schema: {
        properties: {
          data: {
            type: 'object',
            properties: {
              [snakeCase(model.name)]: {
                $ref: getSchemaPath(model),
              },
            },
          },
          message: {
            type: 'string',
            example: 'Updated',
          },
        },
      },
    }),
  );
};

export const ResponseGetOne = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Ok',
      schema: {
        properties: {
          data: {
            type: 'object',
            properties: {
              [snakeCase(model.name)]: {
                $ref: getSchemaPath(model),
              },
            },
          },
          message: {
            type: 'string',
            example: 'Ok',
          },
        },
      },
    }),
  );
};

export const ResponseDeleted = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Deleted',
      schema: {
        properties: {
          data: {
            type: 'object',
            properties: {
              [snakeCase(model.name)]: {
                $ref: getSchemaPath(model),
              },
            },
          },
          message: {
            type: 'string',
            example: 'Deleted',
          },
        },
      },
    }),
  );
};

export interface FileUploadOption extends MulterField {
  required?: boolean;
  bodyField?:
    | string
    | {
        [key: string]: string;
      };
  message?: string;
  storage?: CDNStorage;
}

export const FileUploads = (files: FileUploadOption[]) => {
  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(files),
      ...files.map((x) => new UploadInterceptor(x)),
    ),
  );
};

export const MsListener = (metadata?: string) => {
  return applyDecorators(UseGuards(MsGuard), MessagePattern(metadata));
};
