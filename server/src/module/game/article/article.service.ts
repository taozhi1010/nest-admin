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

    if (query.deptName) {
      entity.andWhere(`entity.deptName LIKE "%${query.deptName}%"`);
    }
    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }
    const res = await entity.getMany();
    return ResultData.ok(res);
  }

  async findOne(deptId: number) {
    // const data = await this.gameAricleEntityRep.findOne({
    //   where: {
    //     deptId: deptId,
    //     delFlag: '0',
    //   },
    // });
    const data = [];
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
    // if (updateGameAricleDto.parentId && updateGameAricleDto.parentId !== 0) {
    //   const parent = await this.gameAricleEntityRep.findOne({
    //     where: {
    //       deptId: updateGameAricleDto.parentId,
    //       delFlag: '0',
    //     },
    //     select: ['ancestors'],
    //   });
    //   if (!parent) {
    //     return ResultData.fail(500, '父级部门不存在');
    //   }
    //   const ancestors = parent.ancestors ? `${parent.ancestors},${updateGameAricleDto.parentId}` : `${updateGameAricleDto.parentId}`;
    //   Object.assign(updateGameAricleDto, { ancestors: ancestors });
    // }
    // await this.gameAricleEntityRep.update({ deptId: updateGameAricleDto.deptId }, updateGameAricleDto);
    return ResultData.ok();
  }

  async remove(deptId: number) {
    // const data = await this.gameAricleEntityRep.update(
    //   { deptId: deptId },
    //   {
    //     delFlag: '1',
    //   },
    // );
    const data = [];
    return ResultData.ok(data);
  }
}
