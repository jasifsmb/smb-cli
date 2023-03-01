import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { FileUploadOption } from '../core.decorators';

@Injectable()
export class UploadInterceptor implements NestInterceptor {
  constructor(private options: FileUploadOption) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { body, files, uploadError } = context.switchToHttp().getRequest();
    /* Fix body properties for null strings */
    for (const key in body) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        if (body[key] === 'null') {
          body[key] = null;
        }
        if (body[key] === 'false') {
          body[key] = false;
        }
      }
    }
    if (!!uploadError) {
      return throwError(
        () =>
          new BadRequestException(
            uploadError || `Upload error - ${this.options.name}`,
          ),
      );
    }
    if (typeof files === 'undefined') return next.handle();
    if (
      !!this.options.required &&
      typeof files[this.options.name] === 'undefined'
    ) {
      return throwError(
        () =>
          new BadRequestException(
            this.options.message || `No file uploaded - ${this.options.name}`,
          ),
      );
    }
    if (
      typeof this.options.bodyField === 'string' &&
      typeof files[this.options.name] !== 'undefined'
    ) {
      body[this.options.bodyField] =
        files[this.options.name][0].key || files[this.options.name][0].filename;
    }
    if (
      typeof this.options.bodyField === 'object' &&
      typeof files[this.options.name] !== 'undefined'
    ) {
      for (const key in this.options.bodyField) {
        if (Object.prototype.hasOwnProperty.call(this.options.bodyField, key)) {
          const prop = this.options.bodyField[key];
          body[key] = files[this.options.name][0][prop];
        }
      }
    }
    return next.handle();
  }
}
