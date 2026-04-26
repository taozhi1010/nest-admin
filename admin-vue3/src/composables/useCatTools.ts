import { isEmpty } from 'radash'

/**
 * 工具函数 Composable
 * 提供常用的工具函数封装
 * @example
 * const { isEmpty } = useCatTools()
 */
export function useCatTools() {
  return {
    /**
     * 判断值是否为空（null、undefined、空字符串、空数组、空对象）
     * 来自 radash 库
     */
    isEmpty
  }
}
