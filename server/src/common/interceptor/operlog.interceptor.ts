import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { OperlogService } from 'src/module/monitor/operlog/operlog.service';

@Injectable()
export class OperlogInterceptor implements NestInterceptor {
  constructor(private readonly operlogService: OperlogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        this.operlogService.logAction(data);
        return data;
      }),
    );
  }
}
