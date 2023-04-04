import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isObject } from 'class-validator';
import { EXCLUDE_TRIM_FIELDS_KEY } from '../decorators/exclude-trim.decorator';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, { type, metatype }: ArgumentMetadata) {
    if (isObject(value) && type === 'body') {
      const excludeTrimFields: string[] =
        new metatype()[EXCLUDE_TRIM_FIELDS_KEY] || [];
      return Array.isArray(excludeTrimFields)
        ? trimFields(value, excludeTrimFields)
        : value;
    } else {
      return value;
    }
  }
}

export function trimFields(value: unknown, exclude: string[] = []) {
  if (!isObject(value)) throw new Error(`Value must be an object`);
  Object.keys(value).forEach((key) => {
    if (!exclude.includes(key)) {
      if (isObject(value[key])) {
        value[key] = trimFields(value[key], []);
      } else {
        if (typeof value[key] === 'string') {
          value[key] = value[key].trim();
        }
      }
    }
  });
  return value;
}
