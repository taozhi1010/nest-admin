import { catTools as npmCatTools } from 'cat-tools'
import { catTools as localCatTools } from '@/utils/catTools'

/**
 * catTools Composable
 * 提供全局工具函数的 Composable 封装
 * 整合了 npm cat-tools 库和本地工具函数
 * @example
 * const { dateFormat, uuid, isNullorUndefined, deepCopy } = useCatTools()
 */
export function useCatTools() {
  return {
    // 本地工具函数
    /**
     * 日期格式化
     * @param date - 日期对象或时间戳
     * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
     */
    dateFormat: localCatTools.dateFormat,

    /**
     * 生成 UUID
     */
    uuid: localCatTools.uuid,

    /**
     * 格式化文件大小
     */
    formatSize: localCatTools.formatSize,

    /**
     * 随机数
     * @param min - 最小值
     * @param max - 最大值
     */
    random: localCatTools.random,

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

    // 导出所有工具方法（优先使用 npm cat-tools，本地函数作为补充）
    ...npmCatTools,
    ...localCatTools
  }
}
