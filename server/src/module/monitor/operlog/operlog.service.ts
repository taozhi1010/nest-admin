import { Injectable, Inject, Scope } from '@nestjs/common';
import { IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysOperlogEntity } from './entities/operlog.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ResultData } from 'src/common/utils/result';
import { AxiosService } from 'src/module/common/axios/axios.service';
import { QueryOperLogDto } from './dto/operLog.dto';
import { ExportTable } from 'src/common/utils/export';
import { Response } from 'express';
import { DictService } from 'src/module/system/dict/dict.service';
import { isEmpty } from 'src/common/utils';

@Injectable({ scope: Scope.REQUEST })
export class OperlogService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request & { user: any },
    @InjectRepository(SysOperlogEntity)
    private readonly operLogEntityRep: Repository<SysOperlogEntity>,
    private readonly axiosService: AxiosService,
    @Inject(DictService)
    private readonly dictService: DictService,
  ) {}

  async findAll(query: QueryOperLogDto) {
    const entity = this.operLogEntityRep.createQueryBuilder('entity');
    if (!isEmpty(query.operId)) {
      entity.andWhere('entity.operId = :operId', { operId: query.operId });
    }
    if (!isEmpty(query.title)) {
      entity.andWhere('entity.title = :title', { title: query.title });
    }
    if (!isEmpty(query.businessType)) {
      entity.andWhere('entity.businessType = :businessType', { businessType: query.businessType + '' });
    }
    if (!isEmpty(query.requestMethod)) {
      entity.andWhere('entity.requestMethod = :requestMethod', { requestMethod: query.requestMethod });
    }
    if (!isEmpty(query.operatorType)) {
      entity.andWhere('entity.operatorType = :operatorType', { operatorType: query.operatorType });
    }
    if (!isEmpty(query.operName)) {
      entity.andWhere('entity.operName LIKE :operName', { operName: `%${query.operName}%` });
    }
    if (!isEmpty(query.deptName)) {
      entity.andWhere('entity.deptName LIKE :deptName', { deptName: `%${query.deptName}%` });
    }
    if (!isEmpty(query.operUrl)) {
      entity.andWhere('entity.operUrl = :operUrl', { operUrl: query.operUrl });
    }
    if (!isEmpty(query.operLocation)) {
      entity.andWhere('entity.operLocation = :operLocation', { operLocation: query.operLocation });
    }
    if (!isEmpty(query.operParam)) {
      entity.andWhere('entity.operParam = :operParam', { operParam: query.operParam });
    }
    if (!isEmpty(query.jsonResult)) {
      entity.andWhere('entity.jsonResult = :jsonResult', { jsonResult: query.jsonResult });
    }
    if (!isEmpty(query.errorMsg)) {
      entity.andWhere('entity.errorMsg = :errorMsg', { errorMsg: query.errorMsg });
    }
    if (!isEmpty(query.method)) {
      entity.andWhere('entity.method = :method', { method: query.method });
    }
    if (!isEmpty(query.operIp)) {
      entity.andWhere('entity.operIp = :operIp', { operIp: query.operIp });
    }
    if (!isEmpty(query.params?.beginTime) && !isEmpty(query.params?.endTime)) {
      entity.andWhere('entity.operTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
    }
    if (!isEmpty(query.status)) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }

    entity.select([
      'entity.operId',
      'entity.title',
      'entity.businessType',
      'entity.requestMethod',
      'entity.operatorType',
      'entity.operName',
      'entity.deptName',
      'entity.operUrl',
      'entity.operLocation',
      'entity.operParam',
      'entity.jsonResult',
      'entity.errorMsg',
      'entity.method',
      'entity.operIp',
      'entity.operTime',
      'entity.status',
      'entity.costTime',
    ]);
    if (query.orderByColumn && query.isAsc) {
      const key = query.isAsc === 'ascending' ? 'ASC' : 'DESC';
      entity.orderBy(`entity.${query.orderByColumn}`, key);
    }

    if (query.pageNum && query.pageSize) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }
    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOne(id: number) {
    const res = await this.operLogEntityRep.findOne({
      where: {
        operId: id,
      },
    });
    return ResultData.ok(res);
  }

  async removeAll() {
    await this.operLogEntityRep.delete({ operId: Not(IsNull()) });
    return ResultData.ok();
  }

  async remove(operId: number) {
    await this.operLogEntityRep.delete({ operId: operId });
    return ResultData.ok();
  }

  /**
   * @description: 录入日志
   */
  async logAction({
    resultData,
    costTime,
    title,
    handlerName,
    errorMsg,
    businessType,
  }: {
    resultData?: any;
    costTime: number;
    title: string;
    handlerName: string;
    errorMsg?: string;
    businessType: number;
  }) {
    const { originalUrl, method, ip, body, query } = this.request;
    const { user } = this.request.user;
    const operLocation = await this.axiosService.getIpAddress(ip);

    const params = {
      title,
      method: handlerName,
      operName: user.nickName,
      deptName: user.deptName,
      operUrl: originalUrl,
      requestMethod: method.toUpperCase(),
      operIp: ip,
      costTime: costTime,
      operLocation: operLocation,
      operParam: JSON.stringify({ ...body, ...query }),
      jsonResult: JSON.stringify(resultData),
      errorMsg,
      businessType,
      operatorType: '1',
      operTime: new Date(),
      status: errorMsg ? '1' : '0',
    };

    await this.operLogEntityRep.save(params);
  }

  /**
   * 导出操作日志数据为xlsx
   * @param res
   */
  async export(res: Response, body: QueryOperLogDto) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body);
    const { data: operatorTypeDict } = await this.dictService.findOneDataType('sys_oper_type');
    const operatorTypeDictMap = {};
    operatorTypeDict.forEach((item) => {
      operatorTypeDictMap[item.dictValue] = item.dictLabel;
    });
    const options = {
      sheetName: '操作日志数据',
      data: list.data.list,
      header: [
        { title: '日志编号', dataIndex: 'operId' },
        { title: '系统模块', dataIndex: 'title', width: 15 },
        { title: '操作类型', dataIndex: 'businessType' },
        { title: '操作人员', dataIndex: 'operName' },
        { title: '主机', dataIndex: 'operIp' },
        { title: '操作状态', dataIndex: 'status' },
        { title: '操作时间', dataIndex: 'operTime', width: 15 },
        {
          title: '消耗时间',
          dataIndex: 'costTime',
          formateStr(value) {
            return value + 'ms';
          },
        },
      ],
      dictMap: {
        status: {
          '0': '成功',
          '1': '失败',
        },
        businessType: operatorTypeDictMap,
      },
    };
    ExportTable(options, res);
  }
}
