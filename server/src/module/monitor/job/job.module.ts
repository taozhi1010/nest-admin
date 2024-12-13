import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { Job } from './entities/job.entity';
import { JobLog } from './entities/job-log.entity';
import { TaskService } from './task.service';
import { JobLogService } from './job-log.service';
import { JobLogController } from './job-log.controller';
import { BackupService } from 'src/module/backup/backup.service';

@Module({
  imports: [NestScheduleModule.forRoot(), TypeOrmModule.forFeature([Job, JobLog])],
  controllers: [JobController, JobLogController],
  providers: [JobService, TaskService, JobLogService, BackupService],
  exports: [JobService],
})
export class JobModule {}
