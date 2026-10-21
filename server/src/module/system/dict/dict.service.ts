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
import { RedisService } from 'src/module/common/redis/redis.service';

const DICT_CACHE_COMPLETE_KEY = 'sys_dict_meta:complete';

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
    await this.clearDictCache();
    return ResultData.ok();
  }

  async deleteType(dictIds: number[]) {
    await this.sysDictTypeEntityRep.update({ dictId: In(dictIds) }, { delFlag: '1' });
    await this.clearDictCache();
    return ResultData.ok();
  }

  async updateType(updateDictTypeDto: UpdateDictTypeDto) {
    await this.sysDictTypeEntityRep.update({ dictId: updateDictTypeDto.dictId }, updateDictTypeDto);
    await this.clearDictCache();
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
    await this.clearDictCache();
    return ResultData.ok();
  }

  async deleteDictData(dictIds: number[]) {
    await this.sysDictDataEntityRep.update({ dictCode: In(dictIds) }, { delFlag: '1' });
    await this.clearDictCache();
    return ResultData.ok();
  }

  async updateDictData(updateDictDataDto: UpdateDictDataDto) {
    await this.sysDictDataEntityRep.update({ dictCode: updateDictDataDto.dictCode }, updateDictDataDto);
    await this.clearDictCache();
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
    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }

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
  async findOneDataType(dictType: string, fresh = false) {
    if (!fresh) {
      const cached = await this.redisService.get(`${CacheEnum.SYS_DICT_KEY}${dictType}`);
      if (cached) {
        return ResultData.ok(cached);
      }
    }

    const data = await this.sysDictDataEntityRep.find({
      where: {
        dictType: dictType,
        delFlag: '0',
      },
    });

    await this.redisService.set(`${CacheEnum.SYS_DICT_KEY}${dictType}`, data);
    return ResultData.ok(data);
  }

  /**
   * 字典版本号：取字典类型和字典数据中最后一次修改时间
   * 返回格式如 2026-10-22 04:03:43，方便人工识别
   */
  async getDictVersion() {
    const stats = await this.sysDictTypeEntityRep.query(`
      SELECT COALESCE(
        DATE_FORMAT(MAX(update_time), '%Y-%m-%d %H:%i:%s'),
        DATE_FORMAT(MAX(create_time), '%Y-%m-%d %H:%i:%s')
      ) AS latest
      FROM sys_dict_type
      UNION ALL
      SELECT COALESCE(
        DATE_FORMAT(MAX(update_time), '%Y-%m-%d %H:%i:%s'),
        DATE_FORMAT(MAX(create_time), '%Y-%m-%d %H:%i:%s')
      ) AS latest
      FROM sys_dict_data
    `);

    const latest = stats
      .map((item: { latest: string | null }) => item.latest || '')
      .sort()
      .pop();

    return ResultData.ok({ version: latest || '1970-01-01 00:00:00' });
  }

  /**
   * 获取所有字典数据，按字典类型分组
   * @returns 返回所有字典数据，格式为 { dictType: [dictDataList] }
   */
  async findAllDictData(fresh = false) {
    try {
      if (!fresh) {
        const complete = await this.redisService.get(DICT_CACHE_COMPLETE_KEY);
        if (complete) {
          const cached = await this.readAllDictCache();
          if (cached) {
            return ResultData.ok(cached);
          }
        }
      }

      // 缓存不完整或强制刷新时，一次性从数据库重建全部字典缓存
      const dicts = await this.loadingDictCache();
      return ResultData.ok(dicts);
    } catch (error) {
      console.error('获取全部字典数据失败:', error);
      throw error;
    }
  }

  private async readAllDictCache(): Promise<Record<string, any[]> | null> {
    const keys = await this.redisService.keys(`${CacheEnum.SYS_DICT_KEY}*`);
    if (!keys || keys.length === 0) {
      return null;
    }

    const values = await this.redisService.mget(keys);
    const result: Record<string, any[]> = {};

    keys.forEach((key, index) => {
      const dictType = key.replace(CacheEnum.SYS_DICT_KEY, '');
      const data = values[index];
      if (dictType && data) {
        result[dictType] = data;
      }
    });

    return result;
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

  /**
   * 导出字典数据为xlsx文件
   * @param res
   */
  async exportData(res: Response, body: ListDictType) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAllData(body);
    const options = {
      sheetName: '字典数据',
      data: list.data.list,
      header: [
        { title: '字典主键', dataIndex: 'dictCode' },
        { title: '字典名称', dataIndex: 'dictLabel' },
        { title: '字典类型', dataIndex: 'dictValue' },
        { title: '备注', dataIndex: 'remark' },
      ],
    };
    ExportTable(options, res);
  }

  /**
   * 刷新字典缓存
   * @returns
   */
  async resetDictCache() {
    await this.loadingDictCache();
    return ResultData.ok();
  }

  /**
   * 删除字典缓存
   * @returns
   */
  async clearDictCache() {
    const keys = await this.redisService.keys(`${CacheEnum.SYS_DICT_KEY}*`);
    if (keys && keys.length > 0) {
      await this.redisService.del(keys);
    }
    await this.redisService.del(DICT_CACHE_COMPLETE_KEY);
  }

  /**
   * 全量加载字典缓存，并写入完整性标记
   * @returns 按字典类型分组的字典数据
   */
  async loadingDictCache() {
    await this.clearDictCache();

    const entity = this.sysDictTypeEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });
    entity.leftJoinAndMapMany(
      'entity.dictTypeList',
      SysDictDataEntity,
      'dictType',
      'dictType.dictType = entity.dictType AND dictType.delFlag = :dataDelFlag',
      { dataDelFlag: '0' },
    );
    const list = await entity.getMany();

    const result: Record<string, any[]> = {};
    await Promise.all(
      list.map(async (item: any) => {
        if (!item.dictType) {
          return;
        }
        const dictData = item.dictTypeList || [];
        result[item.dictType] = dictData;
        await this.redisService.set(`${CacheEnum.SYS_DICT_KEY}${item.dictType}`, dictData);
      }),
    );

    await this.redisService.set(DICT_CACHE_COMPLETE_KEY, '1');
    return result;
  }
}
