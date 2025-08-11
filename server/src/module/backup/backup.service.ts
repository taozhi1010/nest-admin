import { Injectable } from '@nestjs/common'
import { Task } from 'src/common/decorators/task.decorator'

@Injectable()
export class BackupService {
  @Task('dailyBackup')
  async dailyBackup(params: string) {
    console.log('dailyBackup', params)
    // 实现备份逻辑
  }
}
