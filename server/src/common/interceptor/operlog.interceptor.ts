import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { OperlogService } from 'src/module/monitor/operlog/operlog.service'
import { OperlogConfig } from '../decorators/operlog.decorator'

@Injectable()
export class OperlogInterceptor implements NestInterceptor {
  private readonly reflector = new Reflector()

  private readonly logger = new Logger('操作日志')

  constructor(readonly logService: OperlogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logConfig: OperlogConfig = this.reflector.get('operlog', context.getHandler())
    const { summary }
      = this.reflector.getAllAndOverride(`swagger/apiOperation`, [context.getHandler()]) || {}

    const className = context.getClass().name
    const handlerName = context.getHandler().name

    const now = Date.now()

    const user = context.switchToHttp().getRequest()?.user

    const username = user?.user?.username
    const userId = user?.user?.userId

    return next
      .handle()
      .pipe(
        map((resultData) => {
          const costTime = Date.now() - now

          this.logger.log(
            `[${className}.${handlerName}] [${username}:${userId}] ${summary} ${costTime}ms`,
          )
          this.logService.logAction({
            costTime,
            resultData,
            handlerName,
            title: summary,
            businessType: logConfig?.businessType,
          })

          return resultData
        }),
      )
      .pipe(
        catchError((err) => {
          const costTime = Date.now() - now

          this.logger.error(
            `[${className}.${handlerName}] [${username}:${userId}] ${summary} ${costTime}ms`,
          )
          this.logService.logAction({
            costTime,
            status: '1',
            errorMsg: JSON.stringify(err.response?.message),
            handlerName,
            title: summary,
            businessType: logConfig?.businessType,
          })

          return throwError(() => err)
        }),
      )
  }
}
