import * as Lodash from 'lodash';
import { GenConstants } from 'src/common/constant/genConstants';

export const serviceTem = (options) => {
  const { BusinessName, primaryKey, businessName } = options;
  return `
import { InjectRepository } from '@nestjs/typeorm';
import { Repository ,Not ,In,Like} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { Create${Lodash.upperFirst(BusinessName)}Dto, Update${Lodash.upperFirst(BusinessName)}Dto,List${Lodash.upperFirst(BusinessName)}Dto } from './dto/${businessName}.dto';
import { ${Lodash.upperFirst(BusinessName)}Entity } from './entities/${businessName}.entity';

@Injectable()
export class ${Lodash.upperFirst(BusinessName)}Service {
constructor(
    @InjectRepository(${Lodash.upperFirst(BusinessName)}Entity)
    private readonly ${businessName}EntityRep: Repository<${Lodash.upperFirst(BusinessName)}Entity>,
) {}
    async create(create${Lodash.upperFirst(BusinessName)}Dto: Create${Lodash.upperFirst(BusinessName)}Dto) {
        const res = await this.${businessName}EntityRep.save(create${Lodash.upperFirst(BusinessName)}Dto);
        return ResultData.ok(res);
    }

    async findAll(query :List${Lodash.upperFirst(BusinessName)}Dto ) {
        const entity = this.${businessName}EntityRep.createQueryBuilder('entity');
        entity.where({ delFlag: '0'});
        ${getListQueryStr(options)}
        entity.select([${getListFiledSelectStr(options)}])
        entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
        const [list, total] = await entity.getManyAndCount();
        
        return ResultData.ok({
            list,
            total,
        });
    }

    async findOne(id: number) {
        const res = await this.${businessName}EntityRep.findOne({
            where: {
                delFlag: '0',
                ${primaryKey}: id,
            },
        });
        return ResultData.ok(res);
    }

    async update(update${Lodash.upperFirst(BusinessName)}Dto: Update${Lodash.upperFirst(BusinessName)}Dto) {
        const res = await this.${businessName}EntityRep.update({  ${primaryKey}: update${Lodash.upperFirst(BusinessName)}Dto.${primaryKey} }, update${Lodash.upperFirst(BusinessName)}Dto);
        return ResultData.ok(res);
    }

    async remove(id: number) {
        const data = await this.${businessName}EntityRep.update(
            { ${primaryKey}: id },
            {
                delFlag: '1',
            },
        );
        return ResultData.ok(data);
    }
}`;
};

/**
 * 列表返回字段
 * @param options
 * @returns
 */
const getListFiledSelectStr = (options) => {
  const { columns } = options;
  return columns
    .filter((column) => column.isList == '1')
    .map((column) => {
      return `"${column.javaField}"`;
    })
    .join(',');
};

/**
 * 列表查询条件
 * @param options
 * @returns
 */
const getListQueryStr = (options) => {
  const { columns } = options;
  return columns
    .filter((column) => column.isQuery == '1')
    .map((column) => {
      switch (column.queryType) {
        case GenConstants.QUERY_EQ:
          return `entity.andWhere("entity.${column.javaField} = :${column.javaField}", {${column.javaField}: query.${column.javaField}});`;
        case GenConstants.QUERY_NE:
          return `entity.andWhere("entity.${column.javaField} != :${column.javaField}", {${column.javaField}: query.${column.javaField}});`;
        case GenConstants.QUERY_GT:
          return `entity.andWhere("entity.${column.javaField} > :${column.javaField}", {${column.javaField}: query.${column.javaField}});`;
        case GenConstants.QUERY_GTE:
          return `entity.andWhere("entity.${column.javaField} >= :${column.javaField}", {${column.javaField}: query.${column.javaField}});`;
        case GenConstants.QUERY_LT:
          return `entity.andWhere("entity.${column.javaField} < :${column.javaField}", {${column.javaField}: query.${column.javaField}});`;
        case GenConstants.QUERY_LTE:
          return `entity.andWhere("entity.${column.javaField} <= :${column.javaField}", {${column.javaField}: query.${column.javaField}});`;
        case GenConstants.QUERY_LIKE:
          return `entity.andWhere("entity.${column.javaField} LIKE :${column.javaField}", {${column.javaField}: \`%\${query.${column.javaField}}%\`});`;
        case GenConstants.QUERY_BETWEEN:
          return `entity.andWhere("entity.${column.javaField} BETWEEN :start AND :end", { start: query.params.beginTime, end: query.params.endTime });`;
        default:
          return ``;
      }
    })
    .join('\n\t');
};
