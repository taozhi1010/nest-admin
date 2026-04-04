import { catTools } from '@/utils/catTools'

/**
 * catTools Composable
 * 提供全局工具函数的 Composable 封装
 * @example
 * const { dateFormat, deepClone, debounce, throttle } = useCatTools()
 */
export function useCatTools() {
  return {
    /**
     * 日期格式化
     * @param date - 日期对象或时间戳
     * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
     */
    dateFormat: catTools.dateFormat,

    /**
     * 深拷贝
     */
    deepClone: catTools.deepClone,

    /**
     * 防抖函数
     * @param fn - 要执行的函数
     * @param delay - 延迟时间（毫秒）
     */
    debounce: catTools.debounce,

    /**
     * 节流函数
     * @param fn - 要执行的函数
     * @param delay - 延迟时间（毫秒）
     */
    throttle: catTools.throttle,

    /**
     * 生成 UUID
     */
    uuid: catTools.uuid,

    /**
     * 解析 URL 参数
     */
    parseUrl: catTools.parseUrl,

    /**
     * 格式化文件大小
     */
    formatSize: catTools.formatSize,

    /**
     * 随机数
     * @param min - 最小值
     * @param max - 最大值
     */
    random: catTools.random,

    // 导出所有 catTools 方法
    ...catTools
  }
}
