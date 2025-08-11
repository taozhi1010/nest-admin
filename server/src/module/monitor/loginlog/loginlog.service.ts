import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Response } from 'express'
import { ExportTable } from 'src/common/utils/export'
import { ResultData } from 'src/common/utils/result'
import { In, IsNull, Not, Repository } from 'typeorm'

import { AxiosService } from '@/module/common/axios/axios.service'
import { CreateLoginlogDto, ListLoginlogDto } from './dto/index'
import { MonitorLoginlogEntity } from './entities/loginlog.entity'

@Injectable()
export class LoginlogService {
  constructor(
    @InjectRepository(MonitorLoginlogEntity)
    private readonly monitorLoginlogEntityRep: Repository<MonitorLoginlogEntity>,
    private readonly axiosService: AxiosService,
  ) {}

  /**
   * 创建用户登录日志
   * @param createLoginlogDto
   * @returns
   */
  async create(createLoginlogDto: CreateLoginlogDto) {
    const item = await this.monitorLoginlogEntityRep.save(createLoginlogDto)

    this.axiosService
      .getIpAddress(createLoginlogDto.ipaddr)
      .then((res) => {
        this.monitorLoginlogEntityRep.update(item.infoId, { loginLocation: res })
      })
      .catch(() => {
        console.log('获取IP地址失败')
      })

    return item
  }

  /**
   * 日志列表-分页
   * @param query
   * @returns
   */
  async findAll(query: ListLoginlogDto) {
    const entity = this.monitorLoginlogEntityRep.createQueryBuilder('entity')
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' })

    if (query.ipaddr) {
      entity.andWhere(`entity.ipaddr LIKE "%${query.ipaddr}%"`)
    }

    if (query.username) {
      entity.andWhere(`entity.username LIKE "%${query.username}%"`)
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status })
    }

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('entity.loginTime BETWEEN :start AND :end', {
        start: query.params.beginTime,
        end: query.params.endTime,
      })
    }

    if (query.orderByColumn && query.isAsc) {
      const key = query.isAsc === 'ascending' ? 'ASC' : 'DESC'
      entity.orderBy(`entity.${query.orderByColumn}`, key)
    }

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize)
    }

    const [rows, total] = await entity.getManyAndCount()

    return ResultData.rows({ rows, total })
  }

  /**
   * 删除日志
   * @returns
   */
  async remove(ids: string[]) {
    const data = await this.monitorLoginlogEntityRep.update(
      { infoId: In(ids) },
      {
        delFlag: '1',
      },
    )
    return ResultData.ok(data)
  }

  /**
   * 删除全部日志
   * @returns
   */
  async removeAll() {
    await this.monitorLoginlogEntityRep.update(
      { infoId: Not(IsNull()) },
      {
        delFlag: '1',
      },
    )
    return ResultData.ok()
  }

  /**
   * 导出登录日志数据为xlsx
   * @param res
   */
  async export(res: Response, body: ListLoginlogDto) {
    delete body.pageNum
    delete body.pageSize
    const list = await this.findAll(body)
    const options = {
      sheetName: '登录日志',
      data: list.data.list,
      header: [
        { title: '序号', dataIndex: 'infoId' },
        { title: '用户账号', dataIndex: 'username' },
        { title: '登录状态', dataIndex: 'status' },
        { title: '登录地址', dataIndex: 'ipaddr' },
        { title: '登录地点', dataIndex: 'loginLocation' },
        { title: '浏览器', dataIndex: 'browser' },
        { title: '操作系统', dataIndex: 'os' },
        { title: '提示消息', dataIndex: 'message' },
        { title: '访问时间', dataIndex: 'loginTime' },
      ],
      dictMap: {
        status: {
          0: '成功',
          1: '失败',
        },
      },
    }
    ExportTable(options, res)
  }
}
