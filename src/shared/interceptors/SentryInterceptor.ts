import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import * as Sentry from '@sentry/node';

/**
 * This interjector is added on the global scope and captures every exception
 * that is thrown, logs it to sentry and then throws the error, which is then
 * handled by nest.js exception handling.
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: any) => {
        Sentry.captureException(error);

        return throwError(() => error);
      }),
    );
  }
}
