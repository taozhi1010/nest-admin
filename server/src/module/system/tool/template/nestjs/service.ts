import * as Lodash from 'lodash';
import { GenConstants } from 'src/common/constant/gen.constant';

export const serviceTem = (options) => {
  const { BusinessName, primaryKey, businessName } = options;
  return `
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, Like } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { Create${Lodash.upperFirst(BusinessName)}Dto, Update${Lodash.upperFirst(BusinessName)}Dto, Query${Lodash.upperFirst(BusinessName)}Dto } from './dto/${businessName}.dto';
import { ${Lodash.upperFirst(BusinessName)}Entity } from './entities/${businessName}.entity';
import { isEmpty } from 'src/common/utils';

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

  async findAll(query: Query${Lodash.upperFirst(BusinessName)}Dto) {
    const entity = this.${businessName}EntityRep.createQueryBuilder('entity');
    entity.where({ delFlag: '0' });
    ${getListQueryStr(options)}
    entity.select([${getListFiledSelectStr(options)}]);

    if (query.orderByColumn && query.isAsc) {
      const key = query.isAsc === 'ascending' ? 'ASC' : 'DESC';
      entity.orderBy(\`entity.\${query.orderByColumn}\`, key);
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

  async findOne(${primaryKey}: string) {
    const res = await this.${businessName}EntityRep.findOne({
      where: {
        delFlag: '0',
        ${primaryKey}: ${primaryKey},
      },
    });
    return ResultData.ok(res);
  }

  async update(update${Lodash.upperFirst(BusinessName)}Dto: Update${Lodash.upperFirst(BusinessName)}Dto) {
    const res = await this.${businessName}EntityRep.update(
      { ${primaryKey}: update${Lodash.upperFirst(BusinessName)}Dto.${primaryKey} },
      update${Lodash.upperFirst(BusinessName)}Dto
    );
    return ResultData.ok({ value: res.affected >= 1 });
  }

  async remove(${primaryKey}s: number[]) {
    const res = await this.${businessName}EntityRep.update(
      { ${primaryKey}: In(${primaryKey}s) },
      {
        delFlag: '1',
      }
    );
    return ResultData.ok({ value: res.affected >= 1 });
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
      return `"entity.${column.javaField}"`;
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
          return `if (!isEmpty(query.${column.javaField})) {
      entity.andWhere("entity.${column.javaField} = :${column.javaField}", { ${column.javaField}: query.${column.javaField} });
    }`;
        case GenConstants.QUERY_NE:
          return `if (!isEmpty(query.${column.javaField})) {
      entity.andWhere("entity.${column.javaField} != :${column.javaField}", { ${column.javaField}: query.${column.javaField} });
    }`;
        case GenConstants.QUERY_GT:
          return `if (query.${column.javaField}) {
      entity.andWhere("entity.${column.javaField} > :${column.javaField}", { ${column.javaField}: query.${column.javaField} });
    }`;
        case GenConstants.QUERY_GTE:
          return `if (!isEmpty(query.${column.javaField})) {
      entity.andWhere("entity.${column.javaField} >= :${column.javaField}", { ${column.javaField}: query.${column.javaField} });
    }`;
        case GenConstants.QUERY_LT:
          return `if (!isEmpty(query.${column.javaField})) {
      entity.andWhere("entity.${column.javaField} < :${column.javaField}", { ${column.javaField}: query.${column.javaField} });
    }`;
        case GenConstants.QUERY_LTE:
          return `if (!isEmpty(query.${column.javaField})) {
      entity.andWhere("entity.${column.javaField} <= :${column.javaField}", { ${column.javaField}: query.${column.javaField} });
    }`;
        case GenConstants.QUERY_LIKE:
          return `if (!isEmpty(query.${column.javaField})) {
      entity.andWhere("entity.${column.javaField} LIKE :${column.javaField}", { ${column.javaField}: \`%\${query.${column.javaField}}%\` });
    }`;
        case GenConstants.QUERY_BETWEEN:
          return `if (!isEmpty(query.${column.javaField})) {
      entity.andWhere("entity.${column.javaField} BETWEEN :start AND :end", { start: query.${column.javaField}[0], end: query.${column.javaField}[1] });
    }`;
        default:
          return ``;
      }
    })
    .join('\n    ');
};

const getPrimaryKeyType = (options) => {
  const { primaryKey } = options;

  if (!primaryKey) {
    return 'string';
  }
  const primaryKeyColumn = options.columns.find((item) => item.javaField === primaryKey);
  return lowercaseFirstLetter(primaryKeyColumn?.javaType);
};

function lowercaseFirstLetter(str) {
  if (str === 'Date') {
    return 'string';
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}
