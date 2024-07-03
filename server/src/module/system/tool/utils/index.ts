/**
 * 校验数组是否包含指定值
 *
 * @param arr 数组
 * @param targetValue 值
 * @return 是否包含
 */

export function arraysContains(array: string[], value: string): boolean {
  return array.includes(value);
}

/**
 * 获取字段长度
 *
 * @param columnType 列类型
 * @return 截取后的列类型
 */

export function getColumnLength(columnType: string): number {
  const match = columnType.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : 0;
}

export class StringUtils {
  /**
   * 将字符串转换为小驼峰命名法
   * @param {string} str - 输入的字符串，使用下划线分隔
   * @returns {string} - 转换后的小驼峰命名法字符串
   */
  static toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * 将字符串转换为大驼峰命名法
   * @param {string} str - 输入的字符串，使用下划线分隔
   * @returns {string} - 转换后的大驼峰命名法字符串
   */
  static toPascalCase(str: string) {
    return str[0].toUpperCase() + this.toCamelCase(str).slice(1);
  }
}
/**
 * 将字符串转换为驼峰命名法
 * @param {string} str - 输入的字符串，使用下划线分隔
 * @returns {string} - 转换后的驼峰命名法字符串
 */
export function convertToCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * 将字符串的首字母大写
 * @param {string} str - 输入的字符串
 * @returns {string} - 首字母大写后的字符串
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
