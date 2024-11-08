import * as Lodash from 'lodash';
export const dtoTem = (options) => {
  const { BusinessName, primaryKey } = options;
  const req = dtoIsReq(options);
  const list = listDtoTem(options);
  return `
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class Create${Lodash.upperFirst(BusinessName)}Dto {
${req}
}

export class Update${Lodash.upperFirst(BusinessName)}Dto extends PartialType(Create${Lodash.upperFirst(BusinessName)}Dto) {
    @ApiProperty({ required: true })
    @IsNumber()
    ${primaryKey}: number;
}

export class List${Lodash.upperFirst(BusinessName)}Dto {
    @ApiProperty({ required: true })
    @IsNumber()
    pageNum: number;

    @ApiProperty({ required: true })
    @IsNumber()
    pageSize: number;

${list}
}
`;
};

const dtoIsReq = (options) => {
  const { columns } = options;
  return columns
    .filter((column) => column.isPk !== '1')
    .map((column) => {
      const { javaType, javaField, isRequired } = column;
      const type = lowercaseFirstLetter(javaType);
      const decorators = [`@ApiProperty({ required: ${isRequired == 1} })`, isRequired != 1 && `\t@IsOptional()`, '\t' + getValidatorDecorator(javaType)].filter(Boolean).join('\n');

      return `\t${decorators}\n\t${javaField}${isRequired == 1 ? '' : '?'}: ${type == 'Date' ? javaType : type};\n`;
    })
    .join('\n');
};

const listDtoTem = (options) => {
  const { columns } = options;
  return columns
    .filter((column) => column.isQuery == '1')
    .map((column) => {
      const { javaType, javaField, isRequired } = column;
      const type = lowercaseFirstLetter(javaType);
      const decorators = [`@ApiProperty({ required: ${isRequired == 1} })`, isRequired != 1 && '\t@IsOptional()', '\t' + getValidatorDecorator(javaType)].filter(Boolean).join('\n');

      return `\t${decorators}\n\t${javaField}${isRequired == 1 ? '' : '?'}: ${type};\n`;
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
    return 'Date';
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}
