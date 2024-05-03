import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { getMetadataArgsStorage, DataSource } from 'typeorm';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { ResultData } from 'src/common/utils/result';

@Injectable()
export class ToolService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
  create(createToolDto: CreateToolDto) {
    return 'This action adds a new tool';
  }

  findAll() {
    return `This action returns all tool`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tool`;
  }

  update(id: number, updateToolDto: UpdateToolDto) {
    return `This action updates a #${id} tool`;
  }

  remove(id: number) {
    return `This action removes a #${id} tool`;
  }

  /**
   * 数据表列表详情
   * @returns
   */
  async genList() {
    const tableMetas = this.dataSource.entityMetadatas;
    const list = [];
    tableMetas.forEach((tableMeta, index) => {
      const columns = [];
      tableMeta.columns.forEach((column) => {
        columns.push({
          type: column.type,
          comment: column.comment,
          databaseName: column.databaseName,
          propertyName: column.propertyName,
          length: column.length,
          isPrimary: column.isPrimary,
          isNullable: column.isNullable,
          isArray: column.isArray,
        });
      });
      list.push({ id: index + 1, comment: tableMeta.comment, tableName: tableMeta.tableName, targetName: tableMeta.targetName, columns: columns });
    });
    const total = tableMetas.length;
    return ResultData.ok({
      list,
      total,
    });
  }
}
