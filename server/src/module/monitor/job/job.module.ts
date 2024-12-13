import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { Job } from './entities/job.entity';
import { TaskService } from './task.service';
import { BackupService } from 'src/module/backup/backup.service';

@Module({
  imports: [NestScheduleModule.forRoot(), TypeOrmModule.forFeature([Job])],
  controllers: [JobController],
  providers: [JobService, TaskService, BackupService],
  exports: [JobService],
})
export class JobModule {}
