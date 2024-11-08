import { Injectable, Inject, Scope } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOperlogDto } from './dto/create-operlog.dto';
import { UpdateOperlogDto } from './dto/update-operlog.dto';
import { SysOperlogEntity } from './entities/operlog.entity';
import * as Useragent from 'useragent';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ResultData } from 'src/common/utils/result';
import { AxiosService } from 'src/module/axios/axios.service';

@Injectable({ scope: Scope.REQUEST })
export class OperlogService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request & { user: any },
    @InjectRepository(SysOperlogEntity)
    private readonly sysOperlogEntityRep: Repository<SysOperlogEntity>,
    private readonly axiosService: AxiosService,
  ) {}
  create(createOperlogDto: CreateOperlogDto) {
    return 'This action adds a new operlog';
  }

  async findAll(query: any) {
    const entity = this.sysOperlogEntityRep.createQueryBuilder('entity');

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }

    const orderMap = {
      descending: 'DESC',
      ascending: 'ASC',
    };

    if (query.orderByColumn && query.isAsc) {
      entity.orderBy(`entity.${query.orderByColumn}`, orderMap[query.isAsc]);
    }

    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} operlog`;
  }

  update(id: number, updateOperlogDto: UpdateOperlogDto) {
    return `This action updates a #${id} operlog`;
  }

  remove(id: number) {
    return `This action removes a #${id} operlog`;
  }

  /**
   * @description: 录入日志
   */
  async logAction(resultData) {
    const { originalUrl, method, headers, ip, body, query } = this.request;
    const { user } = this.request.user;
    const operLocation = await this.axiosService.getIpAddress(ip);

    const userAgent = headers['user-agent'];
    const parser = Useragent.parse(headers['user-agent']);
    const os = parser.os.toJSON().family;
    const browser = parser.toAgent();

    const params = {
      operName: user.nickName,
      deptName: user.deptName,
      operUrl: originalUrl,
      requestMethod: method.toUpperCase(),
      operIp: ip,
      operLocation: operLocation,
      os: parser.os.toJSON().family,
      browser: parser.toAgent(),
      operParam: JSON.stringify({ ...body, ...query }),
      jsonResult: JSON.stringify(resultData),
    };
    console.log('--------->>>>', user, params);

    await this.sysOperlogEntityRep.save(params);

    // let { userInfo } = this.request.user;
    // // 登录接口需要单独处理
    // const isLogin = originalUrl === '/auth/login';
    // if ((userInfo && method.toUpperCase() !== 'GET') || isLogin) {
    //   // if (isLogin) {
    //   //   // 查询数据库中对应的用户
    //   //   userInfo = await this.prisma.user.findUnique({
    //   //     where: { userName: body.userName },
    //   //   });
    //   // }
    //   // const data: any = {
    //   //   userId: userInfo.id,
    //   //   action: originalUrl,
    //   //   method: method.toUpperCase(),
    //   //   ip,
    //   //   params: { ...body, ...query },
    //   //   os: Object.values(parser.getOS()).join(' '),
    //   //   browser: parser.getBrowser().name,
    //   // };
    //   // // 插入数据到表
    //   // await this.prisma.log.create({
    //   //   data,
    //   // });
    // }
  }
}
