
import { GenConstants } from 'src/common/constant/GenConstants';
export const entityTem = (options)=>{
    const {BusinessName,tableName,tableComment} = options

    const contentTem  = content(options)
    return `
    import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
    import { ApiProperty } from '@nestjs/swagger';
    import { BaseEntity } from 'src/common/entities/base';
    @Entity('${tableName}', {
        comment: '${tableComment}',
      })
    export class ${BusinessName}Entity extends BaseEntity {
        ${contentTem}
    }
    `
}

const content = (options)=>{
    const {columns} = options
    let html = ``
    columns.forEach(column=>{
        const {javaType,javaField,isPk,columnType,columnComment} = column
        const filed = convertToSnakeCase(javaField)
        const type = lowercaseFirstLetter(javaType)
        if(isPk == '1'){
            html += `@PrimaryGeneratedColumn({ type: '${columnType}', name: '${filed}', comment: '${columnComment}' })
            public ${javaField}: ${type};
            `
        }else if (!GenConstants.BASE_ENTITY.includes(javaField)){
            html += `@Column({ type: '${columnType}', name: '${filed}', comment: '${columnComment}' })
            public ${javaField}: ${type};
            `
        }
    })

    return html
  
}

function convertToSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function lowercaseFirstLetter(str) {
    if (str.length === 0) {
        return str;
    }
    return str.charAt(0).toLowerCase() + str.slice(1);
}