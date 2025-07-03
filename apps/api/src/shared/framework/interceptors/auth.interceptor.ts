import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Response } from 'express'

@Injectable()
export class SetAuthCookiesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        const ctx = context.switchToHttp()
        const response = ctx.getResponse<Response>()

        response.cookie('access_token', data.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000,
        })

        response.cookie('refresh_token', data.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        const { accessToken, refreshToken, ...safeData } = data
        return safeData
      }),
    )
  }
}
