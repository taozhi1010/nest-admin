import * as Lodash from 'lodash';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { StatusEnum, SexEnum, DelFlagEnum } from 'src/common/enum/index';

/**
 * 通用枚举映射配置
 */
export const commonExportMap = {
  status: {
    [StatusEnum.NORMAL]: '正常',
    [StatusEnum.STOP]: '停用',
  },
  sex: {
    [SexEnum.MAN]: '男',
    [SexEnum.WOMAN]: '女',
  },
  delFlag: {
    [DelFlagEnum.NORMAL]: '正常',
    [DelFlagEnum.DELETE]: '已删除',
  },
};

export async function ExportTable(
  options: {
    data: any[];
    header: any[];
    dictMap?: any;
    sheetName?: string;
  },
  res: Response,
) {
  let data = options.data;
  const workbook = new ExcelJS.Workbook();
  const sheetName = options.sheetName || 'Sheet1';
  const worksheet = workbook.addWorksheet(sheetName);

  // 添加表头
  worksheet.columns = options.header.map((column) => {
    const width = column.width;
    return {
      header: column.title,
      key: column.dataIndex,
      width: isNaN(width) ? 16 : width,
    };
  });

  const dictMap = { ...commonExportMap, ...options.dictMap };

  // 数据过滤+排序
  data = data.map((item) => {
    const newItem = {};
    options.header.forEach((field) => {
      const dataIndex = field.dataIndex;
      const dataValue = Lodash.get(item, dataIndex);
      if (dictMap && dictMap[dataIndex]) {
        newItem[dataIndex] = dictMap[dataIndex][dataValue] !== undefined ? dictMap[dataIndex][dataValue] : dataValue;
      } else {
        newItem[dataIndex] = dataValue;
      }
    });
    return newItem;
  });

  // 定义表头样式
  const headerStyle: any = {
    font: {
      size: 10,
      bold: true,
      color: { argb: 'ffffff' },
    },
    alignment: { vertical: 'middle', horizontal: 'center' },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '808080' },
    },
    border: {
      top: { style: 'thin', color: { argb: '9e9e9e' } },
      left: { style: 'thin', color: { argb: '9e9e9e' } },
      bottom: { style: 'thin', color: { argb: '9e9e9e' } },
      right: { style: 'thin', color: { argb: '9e9e9e' } },
    },
  };

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.style = headerStyle;
  });

  // 添加数据
  data.forEach((item) => {
    worksheet.addRow(item);
  });

  worksheet.columns.forEach((column) => {
    column.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment;filename=sheet.xlsx');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // 将 Excel 文件的二进制流数据返回给客户端
  res.end(buffer, 'binary');
}
