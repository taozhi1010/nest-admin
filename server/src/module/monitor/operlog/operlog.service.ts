import { Injectable, Inject, Scope } from '@nestjs/common';
import { IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysOperlogEntity } from './entities/operlog.entity';
import { REQUEST } from '@nestjs/core';
import { Request, Response } from 'express';
import { ResultData } from 'src/common/utils/result';
import { ExportTable } from 'src/common/utils/export';
import { AxiosService } from 'src/module/common/axios/axios.service';

@Injectable({ scope: Scope.REQUEST })
export class OperlogService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request & { user: any },
    @InjectRepository(SysOperlogEntity)
    private readonly sysOperlogEntityRep: Repository<SysOperlogEntity>,
    private readonly axiosService: AxiosService,
  ) {}

  async findAll(query: any) {
    const entity = this.sysOperlogEntityRep.createQueryBuilder('entity');

    if (query.title) {
      entity.andWhere('entity.title LIKE :title', { title: `%${query.title}%` });
    }

    if (query.operName) {
      entity.andWhere('entity.operName LIKE :operName', { operName: `%${query.operName}%` });
    }

    if (query.businessType) {
      entity.andWhere('entity.businessType = :businessType', { businessType: query.businessType });
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('entity.operTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
    }

    if (query.orderByColumn && query.isAsc && this.isOperlogField(query.orderByColumn)) {
      const orderMap = {
        descending: 'DESC',
        ascending: 'ASC',
      };
      entity.orderBy(`entity.${query.orderByColumn}`, orderMap[query.isAsc]);
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
   * 导出操作日志数据为xlsx
   * @param res
   */
  async export(res: Response, body: any) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body);
    const options = {
      sheetName: '操作日志',
      data: list.data.list,
      header: [
        { title: '日志编号', dataIndex: 'operId' },
        { title: '系统模块', dataIndex: 'title' },
        { title: '操作类型', dataIndex: 'businessType' },
        { title: '请求方式', dataIndex: 'requestMethod' },
        { title: '操作人员', dataIndex: 'operName' },
        { title: '主机', dataIndex: 'operIp' },
        { title: '操作状态', dataIndex: 'status' },
        { title: '消耗时长(ms)', dataIndex: 'costTime' },
        { title: '操作日期', dataIndex: 'operTime' },
      ],
      dictMap: {
        businessType: {
          '0': '其他',
          '1': '新增',
          '2': '修改',
          '3': '删除',
          '4': '授权',
          '5': '导出',
          '6': '导入',
          '7': '强退',
          '8': '生成代码',
          '9': '清空数据',
        },
        status: {
          '0': '正常',
          '1': '异常',
        },
      },
    };
    ExportTable(options, res);
  }

  async removeAll() {
    await this.sysOperlogEntityRep.delete({ operId: Not(IsNull()) });
    return ResultData.ok();
  }

  async findOne(id: number) {
    const data = await this.sysOperlogEntityRep.findOne({ where: { operId: id } });
    return ResultData.ok(data);
  }

  async remove(id: number) {
    await this.sysOperlogEntityRep.delete({ operId: id });
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

    await this.sysOperlogEntityRep.save(params);
  }

  /**
   * 校验排序字段是否为实体真实列，防止 orderByColumn 拼接注入
   */
  private isOperlogField(field: string): boolean {
    return this.sysOperlogEntityRep.metadata.columns.some((column) => column.propertyName === field);
  }
}
