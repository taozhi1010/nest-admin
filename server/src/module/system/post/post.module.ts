import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SysPostEntity } from './entities/post.entity'
import { PostController } from './post.controller'
import { PostService } from './post.service'

@Module({
  imports: [TypeOrmModule.forFeature([SysPostEntity])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
