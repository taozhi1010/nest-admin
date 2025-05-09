import { GenConstants } from 'src/common/constant/gen.constant';
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
    const { javaType, javaField, isPk, columnType, columnComment, columnDefault } = column;
    const filed = convertToSnakeCase(javaField);
    const type = lowercaseFirstLetter(javaType);
    if (isPk == '1') {
      html += `\t@PrimaryGeneratedColumn({ type: '${columnType}', name: '${filed}', comment: '${columnComment}' })\n\tpublic ${javaField}: ${type};\n`;
    } else {
      //else if (!GenConstants.BASE_ENTITY.includes(javaField))
      html += `\n\t@Column({ type: '${columnType}', name: '${filed}', default: ${getColumnDefault(column)}, comment: '${columnComment}' })\n\tpublic ${javaField}: ${type};\n`;
    }
  });

  return html;
};

function convertToSnakeCase(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function lowercaseFirstLetter(str) {
  if (str.length === 0 || str === 'Date') {
    return str;
  }
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// 字段默认值
function getColumnDefault(column) {
  if (column.columnType === 'char') {
    return column.columnDefault == '1';
  } else if (column.columnType === 'varchar') {
    return "''";
  } else {
    return column.columnDefault;
  }
}
