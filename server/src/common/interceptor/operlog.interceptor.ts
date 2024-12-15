import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

import { OperlogConfig } from '../decorators/operlog.decorator';
import { OperlogService } from 'src/module/monitor/operlog/operlog.service';

@Injectable()
export class OperlogInterceptor implements NestInterceptor {
  private readonly reflector = new Reflector();

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
            this.logService.logAction({ costTime, resultData, handlerName, title: summary, businessType: logConfig?.businessType });
          } else {
            //业务错误
            this.logService.logAction({ costTime, errorMsg: resultData.msg, handlerName, title: summary, businessType: logConfig?.businessType });
          }
          return resultData;
        }),
      )
      .pipe(
        catchError((err) => {
          const costTime = Date.now() - now;
          this.logService.logAction({ costTime, errorMsg: err.response, handlerName, title: summary, businessType: logConfig?.businessType });
          return throwError(() => err);
        }),
      );
  }
}
