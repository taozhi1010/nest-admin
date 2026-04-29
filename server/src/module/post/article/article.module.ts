import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostArticleService } from './article.service';
import { PostArticleController } from './article.controller';
import { PostArticleEntity } from './entities/article.entity';

import { UserEntity } from 'src/module/system/user/entities/sys-user.entity';

/**
 * 文章模块
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PostArticleEntity, UserEntity])],
  controllers: [PostArticleController],
  providers: [PostArticleService],
  exports: [PostArticleService],
})
export class PostArticleModule {}
