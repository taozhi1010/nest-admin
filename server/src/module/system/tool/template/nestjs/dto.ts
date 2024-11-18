import * as Lodash from 'lodash';
export const dtoTem = (options) => {
  const { BusinessName } = options;
  const insertExclude = getExcludeClounmByType(options, 'isInsert');
  const editExclude = getExcludeClounmByType(options, 'isEdit');
  const queryExclude = getExcludeClounmByType(options, 'isQuery');
  const listExclude = getExcludeClounmByType(options, 'isList');
  const All = getAllBaseDto(options);

  return `
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, OmitType, IntersectionType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { CharEnum } from 'src/common/enum/index';


export class Base${Lodash.upperFirst(BusinessName)}Dto{
${All}
}

export class Create${Lodash.upperFirst(BusinessName)}Dto extends OmitType(Base${Lodash.upperFirst(BusinessName)}Dto, [${insertExclude}]){}

export class Update${Lodash.upperFirst(BusinessName)}Dto extends OmitType(Base${Lodash.upperFirst(BusinessName)}Dto, [${editExclude}]){}

export class Query${Lodash.upperFirst(BusinessName)}Dto extends OmitType(IntersectionType( Base${Lodash.upperFirst(BusinessName)}Dto, PagingDto), [${queryExclude}]){}

export class List${Lodash.upperFirst(BusinessName)}Dto  extends OmitType(Base${Lodash.upperFirst(BusinessName)}Dto, [${listExclude}]) {}
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
      return ` '${javaField}'`;
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
      const { javaType, javaField, isRequired, columnComment, columnType } = column;
      const type = lowercaseFirstLetter(javaType);
      const decorators = [
        `@ApiProperty({${columnType === 'char' ? 'enum: CharEnum, ' : ''}required: ${isRequired == 1} , description: '${columnComment}'})`,
        isRequired != 1 && `\t@IsOptional()`,
        '\t' + getValidatorDecorator(javaType),
      ]
        .filter(Boolean)
        .join('\n');

      return `\t${decorators}\n\t${javaField}${isRequired == 1 ? '' : '?'}: ${type == 'Date' ? javaType : type};\n`;
    })
    .join('\n');
};

function getValidatorDecorator(javaType) {
  switch (javaType) {
    case 'String':
      return `@IsString()`;
    case 'Number':
      return `@IsNumber()`;
    case 'Boolean':
      return `@IsBoolean()`;
    case 'Date':
      return `@IsString()`;
    default:
      return ``;
  }
}

function lowercaseFirstLetter(str) {
  if (str === 'Date') {
    return 'string';
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}
