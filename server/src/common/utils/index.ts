import * as Lodash from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear'; // 导入插件
import timezone from 'dayjs/plugin/timezone'; // 导入插件
import utc from 'dayjs/plugin/utc'; // 导入插件
import 'dayjs/locale/zh-cn'; // 导入本地化语言
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isLeapYear); // 使用插件
dayjs.locale('zh-cn'); // 使用本地化语言
dayjs.tz.setDefault('Asia/Beijing');

import { DataScopeEnum } from '../enum/index';

/**
 * 数组转树结构
 * @param arr
 * @param getId
 * @param getLabel
 * @returns
 */
export function ListToTree(arr, getId, getLabel) {
  const kData = {}; // 以id做key的对象 暂时储存数据
  const lData = []; // 最终的数据 arr

  // 第一次遍历，构建 kData
  arr.forEach((m) => {
    const id = getId(m);
    const label = getLabel(m);
    const parentId = +m.parentId;

    kData[id] = {
      id,
      label,
      parentId,
      children: [], // 初始化 children 数组
    };

    // 如果是根节点，直接推入 lData
    if (parentId === 0) {
      lData.push(kData[id]);
    }
  });
  // 第二次遍历，处理子节点
  arr.forEach((m) => {
    const id = getId(m);
    const parentId = +m.parentId;

    if (parentId !== 0) {
      // 确保父节点存在后再添加子节点
      if (kData[parentId]) {
        kData[parentId].children.push(kData[id]);
      } else {
        console.warn(`Parent menuId: ${parentId} not found for child menuId: ${id}`);
      }
    }
  });
  return lData;
}

/**
 * 获取当前时间
 * YYYY-MM-DD HH:mm:ss
 * @returns
 */
export function GetNowDate() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 时间格式化
 * @param date
 * @param format
 * @returns
 */
export function FormatDate(date: Date, format = 'YYYY-MM-DD HH:mm:ss') {
  return date && dayjs(date).format(format);
}

/**
 * 格式化对象中的时间字段
 * @param obj 对象
 * @param fields 需要格式化的时间字段名数组
 * @returns
 */
export function FormatObjectDate<T extends Record<string, any>>(obj: T, fields: string[] = ['createTime', 'updateTime']): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result: any = { ...obj };
  fields.forEach((field) => {
    if (result[field]) {
      result[field] = dayjs(result[field]).format('YYYY-MM-DD HH:mm:ss');
    }
  });
  return result as T;
}

/**
 * 深拷贝
 * @param obj
 * @returns
 */
export function DeepClone<T>(obj: T) {
  return Lodash.cloneDeep(obj);
}

/**
 * 生成唯一id
 * UUID
 * @returns
 */
export function GenerateUUID(): string {
  const uuid = uuidv4();
  return uuid.replaceAll('-', '');
}

/**
 * 数组去重
 * @param list
 * @returns
 */
export function Uniq<T extends number | string>(list: Array<T>): Array<T> {
  return Lodash.uniq(list);
}

/**
 * 分页
 * @param data
 * @param pageSize
 * @param pageNum
 * @returns
 */
export function Paginate(data: { list: Array<any>; pageSize: number; pageNum: number }, filterParam: any) {
  // 检查 pageSize 和 pageNumber 的合法性
  if (data.pageSize <= 0 || data.pageNum < 0) {
    return [];
  }

  // 将数据转换为数组
  let arrayData = Lodash.toArray(data.list);

  if (Object.keys(filterParam).length > 0) {
    arrayData = Lodash.filter(arrayData, (item) => {
      const arr = [];
      if (filterParam.ipaddr) {
        arr.push(Boolean(item.ipaddr.includes(filterParam.ipaddr)));
      }

      if (filterParam.userName && item.userName) {
        arr.push(Boolean(item.userName.includes(filterParam.userName)));
      }
      return !Boolean(arr.includes(false));
    });
  }

  // 获取指定页的数据
  const pageData = arrayData.slice((data.pageNum - 1) * data.pageSize, data.pageNum * data.pageSize);

  return pageData;
}

/**
 * 数据范围过滤
 *
 * @param joinPoint 切点
 * @param user 用户
 * @param deptAlias 部门别名
 * @param userAlias 用户别名
 * @param permission 权限字符
 */
export async function DataScopeFilter<T>(entity: any, dataScope: DataScopeEnum): Promise<T> {
  switch (dataScope) {
    case DataScopeEnum.DATA_SCOPE_CUSTOM:
      // entity.andWhere((qb) => {
      //   const subQuery = qb.subQuery().select('user.deptId').from(User, 'user').where('user.userId = :userId').getQuery();
      //   return 'post.title IN ' + subQuery;
      // });
      break;
    default:
      break;
  }
  return entity;
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

/**
 * Excel 模板配置项
 */
export interface ExcelTemplateConfig {
  /** 工作表名称 */
  sheetName?: string;
  /** 表头配置 */
  columns: Array<{
    /** 表头标题 */
    header: string;
    /** 列键名 */
    key: string;
    /** 列宽 */
    width?: number;
    /** 是否必填（在标题后加*号） */
    required?: boolean;
    /** 数据验证下拉选项 */
    validation?: string[];
  }>;
  /** 示例数据 */
  exampleData?: Record<string, any>;
  /** 文件名 */
  fileName?: string;
}

/**
 * 生成并下载 Excel 模板
 * @param res - Express Response 对象
 * @param config - 模板配置
 * @example
 * // 用户导入模板示例
 * const config: ExcelTemplateConfig = {
 *   sheetName: '用户数据',
 *   columns: [
 *     { header: '用户账号*', key: 'userName', width: 20, required: true },
 *     { header: '用户昵称*', key: 'nickName', width: 20, required: true },
 *     { header: '部门 ID', key: 'deptId', width: 15 },
 *     { header: '性别', key: 'sex', width: 10, validation: ['男', '女', '未知'] },
 *   ],
 *   exampleData: {
 *     userName: 'zhangsan',
 *     nickName: '张三',
 *     sex: '男',
 *   },
 *   fileName: '用户导入模板.xlsx',
 * };
 * await createExcelTemplate(res, config);
 */
export async function createExcelTemplate(res: Response, config: ExcelTemplateConfig): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(config.sheetName || 'Sheet1');

  // 设置表头
  worksheet.columns = config.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  // 设置表头样式
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

  // 设置第一行（表头）样式
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.style = headerStyle;
  });

  // 添加示例数据（第二行）
  if (config.exampleData) {
    const exampleRow = worksheet.addRow(config.exampleData);

    // 设置示例数据样式（灰色背景表示示例）
    exampleRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'f0f0f0' },
      };
      cell.font = { color: { argb: '666666' } };
    });
  }

  // 设置列宽和对齐方式
  worksheet.columns.forEach((column) => {
    column.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // 添加数据验证（下拉选项）- 从第二行开始
  const rowCount = worksheet.rowCount;
  if (rowCount > 1) {
    config.columns.forEach((col, index) => {
      if (col.validation && col.validation.length > 0) {
        const columnLetter = String.fromCharCode(65 + index); // A, B, C...
        for (let i = 2; i <= rowCount; i++) {
          worksheet.getCell(`${columnLetter}${i}`).dataValidation = {
            type: 'list',
            allowBlank: false,
            formulae: [col.validation.join(',')],
          };
        }
      }
    });
  }

  // 设置文件属性
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = config.fileName || 'template.xlsx';
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  // 对文件名进行 URL 编码，支持中文
  res.setHeader('Content-Disposition', `attachment;filename="${encodeURIComponent(fileName)}"`);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(buffer, 'binary');
}
