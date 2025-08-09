import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupService } from 'src/module/backup/backup.service';
import { JobLog } from './entities/job-log.entity';
import { Job } from './entities/job.entity';
import { JobLogController } from './job-log.controller';
import { JobLogService } from './job-log.service';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { TaskService } from './task.service';

@Module({
	imports: [NestScheduleModule.forRoot(), TypeOrmModule.forFeature([Job, JobLog])],
	controllers: [JobController, JobLogController],
	providers: [JobService, TaskService, JobLogService, BackupService],
	exports: [JobService],
})
export class JobModule {}
