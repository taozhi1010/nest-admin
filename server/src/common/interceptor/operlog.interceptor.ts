import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

import { OperlogService } from 'src/module/monitor/operlog/operlog.service';

@Injectable()
export class OperlogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('log', { timestamp: false });

  constructor(
    private readonly operlogService: OperlogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [tagName] = this.reflector.getAllAndOverride(`swagger/apiUseTags`, [context.getClass()]);
    const { summary } = this.reflector.getAllAndOverride(`swagger/apiOperation`, [context.getHandler()]);
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    const now = Date.now();

    return next.handle().pipe(
      map((data) => {
        const methodLink = `${className}.${handlerName}`;
        const title = `${tagName}:${summary}`;
        const costTime = Date.now() - now;
        this.logger.log(`[${methodLink}] ${title} ${costTime}ms`);

        this.operlogService.logAction({
          resultData: data,
          handlerName: methodLink,
          costTime,
          title,
        });
        return data;
      }),
    );
  }
}
