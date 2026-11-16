import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

import { OperlogConfig } from '../decorators/operlog.decorator';
import { OperlogService } from 'src/module/monitor/operlog/operlog.service';

@Injectable()
export class OperlogInterceptor implements NestInterceptor {
  private readonly reflector = new Reflector();
  private readonly logger = new Logger(OperlogInterceptor.name);

  constructor(readonly logService: OperlogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { summary } = this.reflector.getAllAndOverride(`swagger/apiOperation`, [context.getHandler()]);
    const logConfig: OperlogConfig = this.reflector.get('operlog', context.getHandler());

    const handlerName = context.getHandler().name;

    const now = Date.now();

    return next
      .handle()
      .pipe(
        map((resultData) => {
          const costTime = Date.now() - now;
          if (resultData.code === 200) {
            this.safeLogAction({ costTime, resultData, handlerName, title: summary, businessType: logConfig?.businessType });
          } else {
            //业务错误
            this.safeLogAction({ costTime, errorMsg: resultData.msg, handlerName, title: summary, businessType: logConfig?.businessType });
          }
          return resultData;
        }),
      )
      .pipe(
        catchError((err) => {
          const costTime = Date.now() - now;
          this.safeLogAction({ costTime, errorMsg: err.response, handlerName, title: summary, businessType: logConfig?.businessType });
          return throwError(() => err);
        }),
      );
  }

  /**
   * 日志录入为异步旁路：失败仅告警，不影响业务响应（防 unhandledRejection）
   */
  private safeLogAction(payload) {
    this.logService.logAction(payload).catch((error) => {
      this.logger.warn(`操作日志录入失败: ${error?.message ?? error}`);
    });
  }
}
