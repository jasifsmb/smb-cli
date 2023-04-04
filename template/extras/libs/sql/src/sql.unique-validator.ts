import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Sequelize } from 'sequelize-typescript';

@ValidatorConstraint({ async: true })
@Injectable()
export class SqlUniqueValidator implements ValidatorConstraintInterface {
  constructor(private sequelize: Sequelize) {}

  async validate(
    value: any,
    { property, constraints: [modelName] }: ValidationArguments,
  ) {
    if (typeof value === 'undefined') return true;
    return this.sequelize.models[modelName]
      .findOne({ where: { [property]: value } })
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
      validator: SqlUniqueValidator,
    });
  };
}
