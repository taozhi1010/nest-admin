import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository, In } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { CacheEnum } from 'src/common/enum/index';
import { ExportTable } from 'src/common/utils/export';
import { SysDictTypeEntity } from './entities/dict.type.entity';
import { SysDictDataEntity } from './entities/dict.data.entity';
import { CreateDictTypeDto, UpdateDictTypeDto, ListDictType, CreateDictDataDto, UpdateDictDataDto, ListDictData } from './dto/index';
import { RedisService } from 'src/module/redis/redis.service';
@Injectable()
export class DictService {
  constructor(
    @InjectRepository(SysDictTypeEntity)
    private readonly sysDictTypeEntityRep: Repository<SysDictTypeEntity>,
    @InjectRepository(SysDictDataEntity)
    private readonly sysDictDataEntityRep: Repository<SysDictDataEntity>,
    private readonly redisService: RedisService,
  ) {}
  async createType(CreateDictTypeDto: CreateDictTypeDto) {
    await this.sysDictTypeEntityRep.save(CreateDictTypeDto);
    return ResultData.ok();
  }

  async deleteType(dictIds: number[]) {
    await this.sysDictTypeEntityRep.update({ dictId: In(dictIds) }, { delFlag: '1' });
    return ResultData.ok();
  }

  async updateType(updateDictTypeDto: UpdateDictTypeDto) {
    await this.sysDictTypeEntityRep.update({ dictId: updateDictTypeDto.dictId }, updateDictTypeDto);
    return ResultData.ok();
  }

  async findAllType(query: ListDictType) {
    const entity = this.sysDictTypeEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });

    if (query.dictName) {
      entity.andWhere(`entity.dictName LIKE "%${query.dictName}%"`);
    }

    if (query.dictType) {
      entity.andWhere(`entity.dictType LIKE "%${query.dictType}%"`);
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('entity.createTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
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

  async findOneType(dictId: number) {
    const data = await this.sysDictTypeEntityRep.findOne({
      where: {
        dictId: dictId,
        delFlag: '0',
      },
    });
    return ResultData.ok(data);
  }

  async findOptionselect() {
    const data = await this.sysDictTypeEntityRep.find({
      where: {
        delFlag: '0',
      },
    });
    return ResultData.ok(data);
  }

  // 字典数据
  async createDictData(createDictDataDto: CreateDictDataDto) {
    await this.sysDictDataEntityRep.save(createDictDataDto);
    return ResultData.ok();
  }

  async deleteDictData(dictId: number) {
    await this.sysDictDataEntityRep.update({ dictCode: dictId }, { delFlag: '1' });
    return ResultData.ok();
  }

  async updateDictData(updateDictDataDto: UpdateDictDataDto) {
    await this.sysDictDataEntityRep.update({ dictCode: updateDictDataDto.dictCode }, updateDictDataDto);
    return ResultData.ok();
  }

  async findAllData(query: ListDictData) {
    const entity = this.sysDictDataEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });
    if (query.dictLabel) {
      entity.andWhere(`entity.dictLabel LIKE "%${query.dictLabel}%"`);
    }

    if (query.dictType) {
      entity.andWhere(`entity.dictType LIKE "%${query.dictType}%"`);
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }

    entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 根据字典类型查询一个数据类型的信息。
   *
   * @param dictType 字典类型字符串。
   * @returns 返回查询到的数据类型信息，如果未查询到则返回空。
   */
  async findOneDataType(dictType: string) {
    // TODO: 先查询字典类型是否被删除，以下代码被注释
    // const dictTypeData = await this.sysDictTypeEntityRep.findOne({
    //   where: {
    //     dictType: dictType,
    //     delFlag: '0',
    //   },
    // });

    // 尝试从Redis缓存中获取字典数据
    let data = await this.redisService.get(`${CacheEnum.SYS_DICT_KEY}${dictType}`);

    if (data) {
      // 如果缓存中存在，则直接返回缓存数据
      return ResultData.ok(data);
    }

    // 从数据库中查询字典数据
    data = await this.sysDictDataEntityRep.find({
      where: {
        dictType: dictType,
        delFlag: '0',
      },
    });

    // 将查询到的数据存入Redis缓存，并返回数据
    await this.redisService.set(`${CacheEnum.SYS_DICT_KEY}${dictType}`, data);
    return ResultData.ok(data);
  }

  async findOneDictData(dictCode: number) {
    const data = await this.sysDictDataEntityRep.findOne({
      where: {
        dictCode: dictCode,
        delFlag: '0',
      },
    });
    return ResultData.ok(data);
  }

  /**
   * 导出字典数据为xlsx文件
   * @param res
   */
  async export(res: Response, body: ListDictType) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAllType(body);
    const options = {
      sheetName: '字典数据',
      data: list.data.list,
      header: [
        { title: '字典主键', dataIndex: 'dictId' },
        { title: '字典名称', dataIndex: 'dictName' },
        { title: '字典类型', dataIndex: 'dictType' },
        { title: '状态', dataIndex: 'status' },
      ],
    };
    ExportTable(options, res);
  }
}
