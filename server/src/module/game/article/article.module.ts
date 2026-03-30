import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameArticleService } from './article.service';
import { GameArticleController } from './article.controller';
import { gameAricleEntity } from './entities/article.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([gameAricleEntity])],
  controllers: [GameArticleController],
  providers: [GameArticleService],
  exports: [GameArticleService],
})
export class GameArticleModule {}
