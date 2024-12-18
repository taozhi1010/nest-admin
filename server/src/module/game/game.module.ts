import { Module } from '@nestjs/common';
import { GameArticleModule } from './article/article.module';

@Module({
  imports: [GameArticleModule],
  exports: [GameArticleModule],
})
export class GameModule {}
