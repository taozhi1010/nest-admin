import { Module } from '@nestjs/common';
import { PostArticleModule } from './article/article.module';
import { PostSubjectModule } from './subject/subject.module';

/**
 * Post 模块（文章和专栏）
 */
@Module({
  imports: [PostArticleModule, PostSubjectModule],
  exports: [PostArticleModule, PostSubjectModule],
})
export class PostModule {}
