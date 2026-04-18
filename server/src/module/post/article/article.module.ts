import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostArticleService } from './article.service';
import { PostArticleController } from './article.controller';
import { PostArticleEntity } from './entities/article.entity';

/**
 * 文章模块
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PostArticleEntity])],
  controllers: [PostArticleController],
  providers: [PostArticleService],
  exports: [PostArticleService],
})
export class PostArticleModule {}
