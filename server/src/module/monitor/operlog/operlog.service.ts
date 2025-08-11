import { Inject, Injectable, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { Request } from 'express'
import { ResultData } from 'src/common/utils/result'
import { AxiosService } from 'src/module/common/axios/axios.service'
import { IsNull, Not, Repository } from 'typeorm'
import { ExportTable } from 'src/common/utils/export';
import { QueryOperLogDto } from './dto/operlog.dto'
import { SysOperlogEntity } from './entities/operlog.entity'
import { DictService } from 'src/module/system/dict/dict.service';
import { Response } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class OperlogService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request & { user: any },
    @InjectRepository(SysOperlogEntity)
    private readonly sysOperlogEntityRep: Repository<SysOperlogEntity>,
    private readonly axiosService: AxiosService,
    @Inject(DictService)
    private readonly dictService: DictService,
  ) { }
  async findOne(id: number) {
    const res = await this.sysOperlogEntityRep.findOne({
      where: {
        operId: id,
      },
    });
    return ResultData.ok(res);
  }

  async findAll(query: QueryOperLogDto) {
    const entity = this.sysOperlogEntityRep.createQueryBuilder('entity')

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize)
    }

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('entity.operTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
    }
    
    if (query.operName) {
      entity.andWhere('entity.operName LIKE :operName', { operName: `%${query.operName}%` });
    }

    if (query.title) {
      entity.andWhere('entity.title LIKE :title', { title: `%${query.title}%` });
    }

    if (query.businessType) {
      entity.andWhere('entity.businessType = :businessType', { businessType: query.businessType });
    }

    if (query.operIp) {
      entity.andWhere('entity.operIp = :operIp', { operIp: query.operIp });
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }


    if (query.orderByColumn && query.isAsc) {
      const key = query.isAsc === 'ascending' ? 'ASC' : 'DESC';
      entity.orderBy(`entity.${query.orderByColumn}`, key);
    }

    const [rows, total] = await entity.getManyAndCount()

    return ResultData.rows({ rows, total })
  }

  async removeAll() {
    await this.sysOperlogEntityRep.delete({ operId: Not(IsNull()) })
    return ResultData.ok()
  }

  async remove(operId: number) {
    await this.sysOperlogEntityRep.delete({ operId: operId });
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
    status = '0',
    businessType,
  }: {
    resultData?: any
    costTime: number
    title: string
    handlerName: string
    errorMsg?: string
    status?: string
    businessType: number
  }) {
    const { originalUrl, method, ip, body, query } = this.request
    const { user } = this.request.user
    const operLocation = await this.axiosService.getIpAddress(ip)

    const params = {
      title,
      method: handlerName,
      operName: user.nickName,
      deptName: user.deptName,
      operUrl: originalUrl,
      requestMethod: method.toUpperCase(),
      operIp: ip,
      costTime,
      operLocation,
      operParam: JSON.stringify({ ...body, ...query }),
      jsonResult: JSON.stringify(resultData),
      errorMsg,
      status,

      businessType,
      operatorType: 1,
      operTime: new Date(),
    }

    await this.sysOperlogEntityRep.save(params)
  }

  /**
   * @description: 录入扩展日志
   */
  async logExtendedAction(
    logItem: {
      classMethod: string
      classMethodTitle: string
      handleCostTime: number
      handleResult?: any
      handleErrorMsg?: any
      module?: string
    },
    isLogBody = true,
  ) {
    const { originalUrl, method, headers, ip, body, query, user } = this.request

    const userAgent = headers['user-agent']

    const newBody = { ...body }

    if (newBody.password) {
      newBody.password = '******'
    }

    if (newBody.newPassword) {
      newBody.newPassword = '******'
    }

    // 将扩展日志格式转换为标准的操作日志格式
    const params = {
      title: logItem.classMethodTitle || logItem.classMethod,
      method: logItem.classMethod,
      operName: user?.user?.nickName || user?.user?.username || body?.username,
      deptName: user?.user?.deptName || '',
      operUrl: originalUrl,
      requestMethod: method.toUpperCase(),
      operIp: ip,
      costTime: logItem.handleCostTime,
      operLocation: '', // 可以后续补充地理位置信息
      operParam: isLogBody ? JSON.stringify({ body: newBody, query }) : JSON.stringify({ query }),
      jsonResult: isLogBody && logItem.handleResult ? JSON.stringify(logItem.handleResult) : '',
      errorMsg: logItem.handleErrorMsg ? JSON.stringify(logItem.handleErrorMsg) : '',
      status: logItem.handleErrorMsg ? '1' : '0',
      businessType: 0, // 默认为其他操作
      operatorType: 1,
      operTime: new Date(),
    }

    await this.sysOperlogEntityRep.save(params)
  }

  /**
   * 导出操作日志数据为xlsx
   * @param res
   */
  async export(res: Response, body: QueryOperLogDto) {
    delete body.pageNum;
    delete body.pageSize;
    const { data } = await this.findAll(body);
    const { data: operatorTypeDict } = await this.dictService.findOneDataType('sys_oper_type');
    const operatorTypeDictMap = {};
    operatorTypeDict.forEach((item) => {
      operatorTypeDictMap[item.dictValue] = item.dictLabel;
    });
    const options = {
      sheetName: '操作日志数据',
      data: data.rows,
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
