import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Response } from 'express'
import { ExportTable } from 'src/common/utils/export'
import { ResultData } from 'src/common/utils/result'
import { In, Repository } from 'typeorm'

import { CreatePostDto, ListPostDto, UpdatePostDto } from './dto/index'
import { SysPostEntity } from './entities/post.entity'

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(SysPostEntity)
    private readonly sysPostEntityRep: Repository<SysPostEntity>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    await this.sysPostEntityRep.save(createPostDto)
    return ResultData.ok()
  }

  async findAll(query: ListPostDto) {
    const entity = this.sysPostEntityRep.createQueryBuilder('entity')
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' })

    if (query.postName) {
      entity.andWhere(`entity.postName LIKE "%${query.postName}%"`)
    }

    if (query.belongDeptId) {
      entity.andWhere(`entity.deptId = :deptId`, { deptId: +query.belongDeptId })
    }

    if (query.postCode) {
      entity.andWhere(`entity.postCode LIKE "%${query.postCode}%"`)
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status })
    }

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize)
    }

    const [rows, total] = await entity.getManyAndCount()

    return ResultData.rows({ rows, total })
  }

  async findOne(postId: number) {
    const res = await this.sysPostEntityRep.findOne({
      where: {
        postId,
        delFlag: '0',
      },
    })
    return ResultData.ok(res)
  }

  async update(updatePostDto: UpdatePostDto) {
    const res = await this.sysPostEntityRep.update({ postId: updatePostDto.postId }, updatePostDto)
    return ResultData.ok(res)
  }

  async remove(postIds: string[]) {
    const data = await this.sysPostEntityRep.update(
      { postId: In(postIds) },
      {
        delFlag: '1',
      },
    )
    return ResultData.ok(data)
  }

  /**
   * 导出岗位管理数据为xlsx文件
   * @param res
   */
  async export(res: Response, body: ListPostDto) {
    delete body.pageNum
    delete body.pageSize
    const { data } = await this.findAll(body)
    const options = {
      sheetName: '岗位数据',
      data: data.rows,
      header: [
        { title: '岗位序号', dataIndex: 'postId' },
        { title: '岗位编码', dataIndex: 'postCode' },
        { title: '岗位名称', dataIndex: 'postName' },
        { title: '岗位排序', dataIndex: 'postSort' },
        { title: '状态', dataIndex: 'status' },
      ],
    }
    ExportTable(options, res)
  }
}
