import { GenConstants } from 'src/common/constant/genConstants';
import * as Lodash from 'lodash';

export const entityTem = (options) => {
  const { BusinessName, tableName, tableComment } = options;

  const contentTem = content(options);
  return `
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('${tableName}', {
    comment: '${tableComment}',
})
export class ${Lodash.upperFirst(BusinessName)}Entity {
${contentTem}
}
`;
};

const content = (options) => {
  const { columns } = options;
  let html = ``;
  columns.sort((a, b) => b.isPk - a.isPk); //保证主键始终在第一个
  columns.forEach((column) => {
    const { javaType, javaField, isPk, columnType, columnComment } = column;
    const filed = convertToSnakeCase(javaField);
    const type = lowercaseFirstLetter(javaType);
    if (isPk == '1') {
      html += `\t@PrimaryGeneratedColumn({ type: '${columnType}', name: '${filed}', comment: '${columnComment}' })\n\tpublic ${javaField}: ${type};\n`;
    } else if (!GenConstants.BASE_ENTITY.includes(javaField)) {
      html += `\n\t@Column({ type: '${columnType}', name: '${filed}', comment: '${columnComment}' })\n\tpublic ${javaField}: ${type};\n`;
    }
  });

  return html;
};

function convertToSnakeCase(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function lowercaseFirstLetter(str) {
  if (str.length === 0) {
    return str;
  } else if (str === 'Date') {
    return 'Date';
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}
