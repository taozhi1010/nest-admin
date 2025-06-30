import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { ExportTable } from 'src/common/utils/export';
import { CreateConfigDto, UpdateConfigDto, ListConfigDto } from './dto/index';
import { SysConfigEntity } from './entities/config.entity';
import { RedisService } from 'src/module/common/redis/redis.service';
import { CacheEnum } from 'src/common/enum/index';
import { Cacheable, CacheEvict } from 'src/common/decorators/redis.decorator';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(SysConfigEntity)
    private readonly sysConfigEntityRep: Repository<SysConfigEntity>,
    private readonly redisService: RedisService,
  ) {}
  async create(createConfigDto: CreateConfigDto) {
    await this.sysConfigEntityRep.save(createConfigDto);
    return ResultData.ok();
  }

  async findAll(query: ListConfigDto) {
    const entity = this.sysConfigEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });

    if (query.configName) {
      entity.andWhere(`entity.configName LIKE "%${query.configName}%"`);
    }

    if (query.configKey) {
      entity.andWhere(`entity.configKey LIKE "%${query.configKey}%"`);
    }

    if (query.configType) {
      entity.andWhere('entity.configType = :configType', { configType: query.configType });
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

  async findOne(configId: number) {
    const data = await this.sysConfigEntityRep.findOne({
      where: {
        configId: configId,
      },
    });
    return ResultData.ok(data);
  }

  async findOneByConfigKey(configKey: string) {
    const data = await this.getConfigValue(configKey);
    return ResultData.ok(data);
  }

  /**
   * 根据配置键值异步查找一条配置信息。
   *
   * @param configKey 配置的键值，用于查询配置信息。
   * @returns 返回一个结果对象，包含查询到的配置信息。如果未查询到，则返回空结果。
   */
  @Cacheable(CacheEnum.SYS_CONFIG_KEY, '{configKey}')
  async getConfigValue(configKey: string) {
    const data = await this.sysConfigEntityRep.findOne({ where: { configKey: configKey } });
    return data.configValue;
  }

  @CacheEvict(CacheEnum.SYS_CONFIG_KEY, '{updateConfigDto.configKey}')
  async update(updateConfigDto: UpdateConfigDto) {
    await this.sysConfigEntityRep.update(
      {
        configId: updateConfigDto.configId,
      },
      updateConfigDto,
    );
    return ResultData.ok();
  }

  async remove(configIds: number[]) {
    const list = await this.sysConfigEntityRep.find({
      where: {
        configId: In(configIds),
        delFlag: '0',
      },
      select: ['configType', 'configKey'],
    });
    const item = list.find((item) => item.configType === 'Y');
    if (item) {
      return ResultData.fail(500, `内置参数【${item.configKey}】不能删除`);
    }
    const data = await this.sysConfigEntityRep.update(
      { configId: In(configIds) },
      {
        delFlag: '1',
      },
    );
    return ResultData.ok(data);
  }

  /**
   * 导出参数管理数据为xlsx
   * @param res
   */
  async export(res: Response, body: ListConfigDto) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body);
    const options = {
      sheetName: '参数管理',
      data: list.data.list,
      header: [
        { title: '参数主键', dataIndex: 'configId' },
        { title: '参数名称', dataIndex: 'configName' },
        { title: '参数键名', dataIndex: 'configKey' },
        { title: '参数键值', dataIndex: 'configValue' },
        { title: '系统内置', dataIndex: 'configType' },
      ],
      dictMap: {
        configType: {
          Y: '是',
          N: '否',
        },
      },
    };
    ExportTable(options, res);
  }

  /**
   * 刷新系统配置缓存
   * @returns
   */
  async resetConfigCache() {
    await this.clearConfigCache();
    await this.loadingConfigCache();
    return ResultData.ok();
  }

  /**
   * 删除系统配置缓存
   * @returns
   */
  @CacheEvict(CacheEnum.SYS_CONFIG_KEY, '*')
  async clearConfigCache() {}

  /**
   * 加载系统配置缓存
   * @returns
   */
  async loadingConfigCache() {
    const entity = this.sysConfigEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });
    const list = await entity.getMany();
    list.forEach((item) => {
      if (item.configKey) {
        this.redisService.set(`${CacheEnum.SYS_CONFIG_KEY}${item.configKey}`, item.configValue);
      }
    });
  }
}
