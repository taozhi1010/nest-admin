import * as Lodash from 'lodash';
import { GenConstants } from 'src/common/constant/gen.constant';
export const dtoTem = (options) => {
  const { BusinessName } = options;
  const insertExclude = getExcludeClounmByType(options, 'isInsert');
  const editExclude = getExcludeClounmByType(options, 'isEdit');
  const queryExclude = getExcludeClounmByType(options, 'isQuery');
  const listExclude = getExcludeClounmByType(options, 'isList');
  const All = getAllBaseDto(options);

  return `
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, OmitType, IntersectionType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { CharEnum } from 'src/common/enum/index';
import { Type } from 'class-transformer';


export class Base${Lodash.upperFirst(BusinessName)}Dto{
${All}
}

export class Create${Lodash.upperFirst(BusinessName)}Dto extends ${getOmitTypeStr(`Base${Lodash.upperFirst(BusinessName)}Dto`, insertExclude)}{}

export class Update${Lodash.upperFirst(BusinessName)}Dto extends ${getOmitTypeStr(`Base${Lodash.upperFirst(BusinessName)}Dto`, editExclude)}{}

export class Query${Lodash.upperFirst(BusinessName)}Dto extends ${getOmitTypeStr(`IntersectionType(Base${Lodash.upperFirst(BusinessName)}Dto, PagingDto)`, queryExclude)}{}

export class List${Lodash.upperFirst(BusinessName)}Dto extends ${getOmitTypeStr(`Base${Lodash.upperFirst(BusinessName)}Dto`, listExclude)}{}
`;
};

/**
 * 排除对应类型的字段
 * @param options
 * @param type
 * @returns
 */
const getExcludeClounmByType = (options, type) => {
  const { columns } = options;
  return columns
    .filter((column) => {
      return column[type] === '0';
    })
    .map((column) => {
      const { javaField } = column;
      return `'${javaField}'`;
    })
    .join(',');
};

/**
 * 全局的字段
 * @param options
 * @param type
 * @returns
 */
const getAllBaseDto = (options) => {
  const { columns } = options;
  return columns
    .map((column) => {
      const { javaType, javaField, isRequired, columnComment, columnType, queryType } = column;
      const type = lowercaseFirstLetter(javaType, queryType);
      const decorators = [
        `@ApiProperty({${columnType === 'char' ? 'enum: CharEnum, ' : ''}required: ${isRequired == 1} , description: '${columnComment}'})`,
        isRequired != 1 && `\t@IsOptional()`,
        '\t' + getValidatorDecorator(javaType, queryType),
      ]
        .filter(Boolean)
        .join('\n');

      return `\t${decorators}\n\t${javaField}${isRequired == 1 ? '' : '?'}: ${type};\n`;
    })
    .join('\n');
};

function getValidatorDecorator(javaType, queryType) {
  switch (javaType) {
    case 'String':
      return `@IsString()`;
    case 'Number':
      return `@IsNumber()\n\t@Type(() => Number)`;
    case 'Boolean':
      return `@IsBoolean()`;
    case 'Date':
      return queryType === GenConstants.QUERY_BETWEEN ? '@IsArray()\n\t@IsString({ each: true })' : '@IsString()';
    default:
      return ``;
  }
}

function lowercaseFirstLetter(str, queryType) {
  if (str === 'Date') {
    return queryType === GenConstants.QUERY_BETWEEN ? 'Array<string>' : 'string';
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function getOmitTypeStr(str, excludesStr) {
  if (excludesStr) {
    return `OmitType(${str}, [${excludesStr}])`;
  } else {
    return str;
  }
}
