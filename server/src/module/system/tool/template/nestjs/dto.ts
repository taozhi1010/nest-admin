import * as Lodash from 'lodash';
export const dtoTem = (options) => {
  const { BusinessName, primaryKey } = options;
  const insert = dtoGenerate(options, 'isInsert');
  const edit = dtoGenerate(options, 'isEdit');
  const list = dtoGenerate(options, 'isQuery');
  return `
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';

export enum CharEnum {
  ENABLE = '0',
  DISABLE = '1',
}

export class Create${Lodash.upperFirst(BusinessName)}Dto {
${insert}
}

export class Update${Lodash.upperFirst(BusinessName)}Dto{
 ${edit}
}

export class List${Lodash.upperFirst(BusinessName)}Dto extends PagingDto{
${list}
}
`;
};

const dtoGenerate = (options, type) => {
  const { columns } = options;
  return columns
    .filter((column) => column[type] === '1')
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
      return `@IsDate()`;
    default:
      return ``;
  }
}

function lowercaseFirstLetter(str) {
  if (str === 'Date') {
    return str;
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}
