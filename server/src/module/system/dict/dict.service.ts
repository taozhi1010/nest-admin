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

// 全部字典共用一个缓存 key，value 为 { dictType: dictDataList }
const DICT_ALL_CACHE_KEY = `${CacheEnum.SYS_DICT_KEY}all`;

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
      entity.andWhere('entity.dictName LIKE :dictName', { dictName: `%${query.dictName}%` });
    }

    if (query.dictType) {
      entity.andWhere('entity.dictType LIKE :dictType', { dictType: `%${query.dictType}%` });
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
      entity.andWhere('entity.dictLabel LIKE :dictLabel', { dictLabel: `%${query.dictLabel}%` });
    }

    if (query.dictType) {
      entity.andWhere('entity.dictType LIKE :dictType', { dictType: `%${query.dictType}%` });
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
   * 根据字典类型查询字典数据
   * 缓存只有“有/无”两种状态，缺失或强制刷新时重建全部字典
   */
  async findOneDataType(dictType: string, fresh = false) {
    const cached = fresh ? null : await this.readDictCache();
    const dicts = cached || (await this.rebuildDictCache());
    return ResultData.ok(dicts[dictType] || []);
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
        const cached = await this.readDictCache();
        if (cached) {
          return ResultData.ok(cached);
        }
      }

      // 缓存缺失或强制刷新时，从数据库重建全部字典缓存
      return ResultData.ok(await this.rebuildDictCache());
    } catch (error) {
      console.error('获取全部字典数据失败:', error);
      throw error;
    }
  }

  /** 读取全量字典缓存，未命中返回 null */
  private async readDictCache(): Promise<Record<string, any[]> | null> {
    return await this.redisService.get(DICT_ALL_CACHE_KEY);
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
    await this.rebuildDictCache();
    return ResultData.ok();
  }

  /**
   * 删除字典缓存
   * @returns
   */
  async clearDictCache() {
    await this.redisService.del(DICT_ALL_CACHE_KEY);
  }

  /** 重建中的任务，避免冷启动时并发重复查库 */
  private rebuildTask: Promise<Record<string, any[]>> | null = null;

  /** 重建全部字典缓存，同一时刻只执行一次 */
  private rebuildDictCache(): Promise<Record<string, any[]>> {
    if (this.rebuildTask) {
      return this.rebuildTask;
    }

    const task = this.buildDictCache().finally(() => {
      if (this.rebuildTask === task) {
        this.rebuildTask = null;
      }
    });
    this.rebuildTask = task;
    return task;
  }

  /**
   * 从数据库加载全部字典并覆盖缓存
   * 直接覆盖而不先删除，避免重建失败时出现缓存空窗
   */
  private async buildDictCache(): Promise<Record<string, any[]>> {
    const entity = this.sysDictTypeEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });
    entity.leftJoinAndMapMany('entity.dictTypeList', SysDictDataEntity, 'dictType', 'dictType.dictType = entity.dictType AND dictType.delFlag = :dataDelFlag', { dataDelFlag: '0' });
    const list = await entity.getMany();

    const result: Record<string, any[]> = {};
    list.forEach((item: any) => {
      if (item.dictType) {
        result[item.dictType] = item.dictTypeList || [];
      }
    });

    await this.redisService.set(DICT_ALL_CACHE_KEY, result);
    return result;
  }
}
