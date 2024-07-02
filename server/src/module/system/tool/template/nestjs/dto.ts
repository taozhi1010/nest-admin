export const dtoTem = (options) => {
    const { BusinessName, primaryKey } = options;
    const req = dtoIsReq(options);
    const list = listDtoTem(options)
    return `
    import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum, ApiProperty } from 'class-validator';
    import { ApiProperty } from '@nestjs/swagger';

    export class Create${BusinessName}Dto {
        ${req}
    }

    export class Update${BusinessName}Dto extends Create${BusinessName}Dto {
        @ApiProperty({ required: false })
        @IsNumber()
        ${primaryKey}: number;
    }

    export class List${BusinessName}Dto {
       ${list}
    }
    `;
};

const dtoIsReq = (options) => {
    const { columns } = options;
    return columns.map(column => {
        const { javaType, javaField, isRequired } = column;
        const type = lowercaseFirstLetter(javaType);
        const decorators = [
            `@ApiProperty({ required: ${isRequired == 1} })`,
            isRequired != 1 && '@IsOptional()',
            getValidatorDecorator(javaType)
        ].filter(Boolean).join('\n');

        return `
        ${decorators}${javaField}${isRequired == 1 ? '' : '?'}: ${type == 'date' ? javaType : type};
        `;
    }).join('\n');
};

const listDtoTem = (options) => {
    const { columns } = options;
    return columns.filter(column => column.isQuery == '1').map(column => {
        const { javaType, javaField, isRequired } = column;
        const type = lowercaseFirstLetter(javaType);
        const decorators = [
            `@ApiProperty({ required: ${isRequired == 1} })`,
            isRequired != 1 && '@IsOptional()',
            getValidatorDecorator(javaType)
        ].filter(Boolean).join('\n');

        return `
        ${decorators}
        ${javaField}${isRequired == 1 ? '' : '?'}: ${type? javaType : type};
        `;
    }).join('\n');
};

function getValidatorDecorator(javaType) {
    switch (javaType) {
        case 'String': return '@IsString()';
        case 'Number': return '@IsNumber()';
        case 'Boolean': return '@IsBoolean()';
        case 'Date': return '@IsDate()';
        default: return '';
    }
}

function lowercaseFirstLetter(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}