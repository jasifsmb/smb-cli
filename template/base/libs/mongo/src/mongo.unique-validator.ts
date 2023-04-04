import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Connection } from 'mongoose';

@ValidatorConstraint({ async: true })
@Injectable()
export class MongoUniqueValidator implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private connection: Connection) {}

  async validate(
    value: any,
    { property, constraints: [modelName] }: ValidationArguments,
  ) {
    if (typeof value === 'undefined') return true;
    return this.connection.models[modelName]
      .findOne({ [property]: value })
      .then((data) => {
        return data === null;
      });
  }

  public defaultMessage({
    property,
    constraints: [modelName],
  }: ValidationArguments) {
    return `${modelName} with the same '${property}' already exist`;
  }
}

/**
 * Decorator to set a field unique in the database
 *
 * @param {string} modelName Name of the model
 * @param {ValidationOptions} [validationOptions] Other validation options
 *
 * Eg: Set `name` field unique in `Page` module
 *```js
 * @IsUnique('Page')
 * name: string;
 * ```
 */
export function IsUnique(
  modelName: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [modelName],
      validator: MongoUniqueValidator,
    });
  };
}
