import { catTools as npmCatTools } from 'cat-tools'
import { isEmpty } from 'radash'
import dayjs from 'dayjs'

// ==================== 本地工具函数 ====================

/**
 * 日期格式化（基于 dayjs）
 * @param date - 日期对象、字符串或时间戳
 * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
function dateFormat(date: any, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * catTools Composable
 * 提供全局工具函数的 Composable 封装
 * 整合了 npm cat-tools 库、radash 和本地工具函数
 * @example
 * const { dateFormat, isEmpty, deepCopy } = useCatTools()
 */
export function useCatTools() {
  return {
    // 本地工具函数
    dateFormat,
    
    // radash 工具函数
    /**
     * 判断值是否为空（null、undefined、空字符串、空数组、空对象）
     */
    isEmpty,

    // npm cat-tools 库的工具函数（优先使用）
    /**
     * 数组去重
     */
    uniqueArr: npmCatTools.uniqueArr,

    /**
     * 深拷贝对象
     */
    deepCopy: npmCatTools.deepCopy,

    /**
     * 判断是否为有效数字
     */
    isNumber: npmCatTools.isNumber,

    /**
     * 数字千分位格式化
     */
    toThousandFilter: npmCatTools.toThousandFilter,

    /**
     * 移除数组中的 null/undefined
     */
    removeArrayNull: npmCatTools.removeArrayNull,

    /**
     * 根据指定键对对象数组去重
     */
    arrObjDistinct: npmCatTools.arrObjDistinct,

    /**
     * 字符串去重
     */
    strDistinct: npmCatTools.strDistinct,

    /**
     * 计算字符串长度（考虑中文字符）
     */
    strLen: npmCatTools.strLen,

    /**
     * 下划线转小驼峰
     */
    lineToLowerCamelCase: npmCatTools.lineToLowerCamelCase,

    /**
     * 生成随机验证码
     */
    createRandomCode: npmCatTools.createRandomCode,

    /**
     * 增强版日志输出
     */
    logCat: npmCatTools.logCat,

    // 导出所有 npm cat-tools 工具方法
    ...npmCatTools
  }
}
