import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostSubjectService } from './subject.service';
import { PostSubjectController } from './subject.controller';
import { PostSubjectEntity } from './entities/subject.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PostSubjectEntity])],
  controllers: [PostSubjectController],
  providers: [PostSubjectService],
  exports: [PostSubjectService],
})
export class PostSubjectModule {}
