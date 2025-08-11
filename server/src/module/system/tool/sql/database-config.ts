/**
 * 数据库SQL常量配置
 * 用于处理不同数据库之间的语法差异
 */

export const DATABASE_CONFIG = {
  // MySQL/MariaDB 配置
  mysql: {
    // 获取当前数据库名
    getCurrentSchema: '(SELECT DATABASE())',
    // 参数占位符
    paramPlaceholder: (index: number) => '?',
    // 字符串连接函数
    concat: (parts: string[]) => `CONCAT(${parts.join(', ')})`,
    // 字符串包含查询
    like: (field: string, param: string) => `${field} LIKE CONCAT('%', ${param}, '%')`,
    // 分页语法
    pagination: (pageNum: number, pageSize: number) =>
      `LIMIT ${(pageNum - 1) * pageSize}, ${pageSize}`,
    // 字段类型提取
    columnTypeExtract: 'SUBSTRING_INDEX(column_type, \'(\', 1)',
    // 自增字段判断
    isAutoIncrement: 'extra = \'auto_increment\'',
    // 表注释字段
    tableCommentField: 'table_comment',
    // 字段注释字段
    columnCommentField: 'column_comment',
    // 创建时间字段
    createTimeField: 'create_time',
    // 更新时间字段
    updateTimeField: 'update_time',
  },

  // PostgreSQL 配置
  postgres: {
    // 获取当前数据库名
    getCurrentSchema: 'CURRENT_SCHEMA()',
    // 参数占位符
    paramPlaceholder: (index: number) => `$${index}`,
    // 字符串连接函数
    concat: (parts: string[]) => parts.join(' || '),
    // 字符串包含查询
    like: (field: string, param: string) => `${field} LIKE ${param}`,
    // 分页语法
    pagination: (pageNum: number, pageSize: number) =>
      `LIMIT ${pageSize} OFFSET ${(pageNum - 1) * pageSize}`,
    // 字段类型提取
    columnTypeExtract: 'data_type',
    // 自增字段判断
    isAutoIncrement: 'column_default LIKE \'nextval%\'',
    // 表注释字段（通过pg_description获取）
    tableCommentField: 'COALESCE(d.description, \'\')',
    // 字段注释字段（通过pg_description获取）
    columnCommentField: 'COALESCE(d.description, \'\')',
    // 创建时间字段（PostgreSQL没有自动记录，使用当前时间）
    createTimeField: 'CURRENT_TIMESTAMP',
    // 更新时间字段（PostgreSQL没有自动记录，使用当前时间）
    updateTimeField: 'CURRENT_TIMESTAMP',
  },
}

export type DatabaseType = keyof typeof DATABASE_CONFIG
