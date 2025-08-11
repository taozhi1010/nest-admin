import { EventEmitter2 } from '@nestjs/event-emitter'
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm'
import { SysOperlogEntity } from './entities/operlog.entity'

export class OperlogEvent {
  constructor(public readonly data: any) {}
}

@EventSubscriber()
export class SysOperlogSubscriber implements EntitySubscriberInterface<SysOperlogEntity> {
  constructor(
    private eventEmitter: EventEmitter2,
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this)
  }

  listenTo() {
    return SysOperlogEntity
  }

  beforeInsert(event: InsertEvent<SysOperlogEntity>) {
    const data = event.entity
    this.eventEmitter.emit(
      'operlog',
      new OperlogEvent({
        type: data.status,
        message: `${data.operName} 操作 ${data.title} ${data.status === '0' ? '成功' : '未成功'}`,
      }),
    )
  }
}
