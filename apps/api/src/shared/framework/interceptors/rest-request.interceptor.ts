import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class RestRequestInterceptor<T extends object>
  implements NestInterceptor<any, T>
{
  constructor(private readonly dto: new () => T) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<T> {
    const request = _context.switchToHttp().getRequest();
    return next.handle().pipe(
      switchMap(async () => {
        const transformedData = plainToInstance(this.dto, request.body, {
          excludeExtraneousValues: true,
        });
        const errors = await validate(transformedData);

        if (errors.length > 0) {
          throw new BadRequestException({
            message: 'Response validation failed',
            errors,
          });
        }
        return transformedData;
      }),
    );
  }
}
