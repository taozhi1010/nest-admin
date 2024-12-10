import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { gameAricleEntity } from './entities/article.entity';
import { CreateGameAricleDto, UpdateGameAricleDto, ListGameAricleDto } from './dto/index';

@Injectable()
export class GameArticleService {
  constructor(
    @InjectRepository(gameAricleEntity)
    private readonly gameAricleEntityRep: Repository<gameAricleEntity>,
  ) {}

  async create(createGameAricleDto: CreateGameAricleDto) {
    await this.gameAricleEntityRep.save(createGameAricleDto);
    return ResultData.ok();
  }

  async findAll(query: ListGameAricleDto) {
    const entity = this.gameAricleEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });

    if (query.title) {
      entity.andWhere(`entity.title LIKE "%${query.title}%"`);
    }
    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.orderByColumn && query.isAsc) {
      const key = query.isAsc === 'ascending' ? 'ASC' : 'DESC';
      entity.orderBy(`entity.${query.orderByColumn}`, key);
    }

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }

    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOne(articleId: number) {
    const data = await this.gameAricleEntityRep.findOne({
      where: {
        articleId: articleId,
        delFlag: '0',
      },
    });

    return ResultData.ok(data);
  }

  async findListExclude(id: number) {
    //TODO 需排出ancestors 中不出现id的数据
    const data = await this.gameAricleEntityRep.find({
      where: {
        delFlag: '0',
      },
    });
    return ResultData.ok(data);
  }

  async update(updateGameAricleDto: UpdateGameAricleDto) {
    await this.gameAricleEntityRep.update(
      {
        articleId: updateGameAricleDto.articleId,
      },
      updateGameAricleDto,
    );
    return ResultData.ok();
  }

  async remove(articleId: number) {
    const data = await this.gameAricleEntityRep.update(
      { articleId: articleId },
      {
        delFlag: '1',
      },
    );
    console.log(data);
    return ResultData.ok(true);
  }
}
