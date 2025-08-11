import { Controller, MessageEvent, Sse } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ApiTags } from '@nestjs/swagger'
import { Observable, Subject } from 'rxjs'
import { OperlogEvent } from 'src/module/monitor/operlog/operlog.subscriber'

@ApiTags('sse')
@Controller('resource')
export class SSEController {
  private eventSubject: Subject<MessageEvent> = new Subject<MessageEvent>()

  constructor() {}

  @OnEvent('operlog')
  async handleOperlogEvent(payload: OperlogEvent) {
    this.eventSubject.next({
      data: payload.data,
    })
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.eventSubject.asObservable()
  }
}
