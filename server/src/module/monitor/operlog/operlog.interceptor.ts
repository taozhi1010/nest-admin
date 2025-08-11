import {
  applyDecorators,
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { OperlogService } from './operlog.service'

@Injectable()
export class OperlogInterceptor implements NestInterceptor {
  private readonly logger: Logger

  private readonly reflector = new Reflector()

  constructor(readonly operlogService: OperlogService) {
    this.logger = new Logger('操作日志', { timestamp: false })
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [tagName] = this.reflector.getAllAndOverride(`swagger/apiUseTags`, [context.getClass()])
    const { summary } = this.reflector.getAllAndOverride(`swagger/apiOperation`, [
      context.getHandler(),
    ])

    const module = this.reflector.get('log:module', context.getHandler())
    const ignoreResult = this.reflector.get('log:ignoreResult', context.getHandler())
    const isLogBody = this.reflector.get('log:isLogBody', context.getHandler())

    const className = context.getClass().name
    const handlerName = context.getHandler().name

    const classMethod = `${className}.${handlerName}`
    const classMethodTitle = `${tagName}:${summary}`

    const now = Date.now()

    return next
      .handle()
      .pipe(
        map((handleResult) => {
          const handleCostTime = Date.now() - now

          this.logger.log(`[${classMethod}] ${classMethodTitle} ${handleCostTime}ms`)
          this.operlogService.logExtendedAction(
            {
              classMethod,
              classMethodTitle,
              handleCostTime,
              handleResult: ignoreResult ? undefined : handleResult,
              module,
            },
            isLogBody,
          )

          return handleResult
        }),
      )
      .pipe(
        catchError((err) => {
          const handleCostTime = Date.now() - now

          this.logger.error(`[${classMethod}] ${classMethodTitle} ${handleCostTime}ms`)
          this.operlogService.logExtendedAction(
            {
              classMethod,
              classMethodTitle,
              handleCostTime,
              handleErrorMsg: err.response?.message,
              module,
            },
            isLogBody,
          )

          return throwError(() => err)
        }),
      )
  }
}

export function Log(module?: string, options?: { ignoreResult?: boolean, isLogBody?: boolean }) {
  return applyDecorators(
    SetMetadata('log:module', module),
    SetMetadata('log:ignoreResult', options?.ignoreResult),
    SetMetadata('log:isLogBody', options?.isLogBody),
    UseInterceptors(OperlogInterceptor),
  )
}

export function LogFactory(module?: string) {
  return (options?: { ignoreResult?: boolean, isLogBody?: boolean }) => Log(module, options)
}
