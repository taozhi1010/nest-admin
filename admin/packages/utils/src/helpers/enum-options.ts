/**
 * @author dap
 * @description 枚举选项
 */

/**
 * 定义options类型
 */
export interface EnumsOption {
  /**
   * 枚举名称 建议使用全大写字母_
   */
  enumName: string;
  /**
   * option的标签
   */
  label: string;
  /**
   * option的值
   */
  value: boolean | number | string;
}

export type EnumResult<T extends readonly EnumsOption[]> = {
  [key in T[number]['enumName']]: Extract<
    T[number],
    { enumName: key }
  >['value'];
};

/**
 * 将options转为枚举
 * 注意自定义的options需要加上as const作为常量处理
 * 详见: packages\utils\src\helpers\__tests__\enum-options.test.ts
 * @param options 枚举选项
 * @returns 转枚举
 */
export function optionsToEnum<T extends readonly EnumsOption[]>(
  options: T,
): EnumResult<T> {
  type K = T[number]['enumName'];
  const result = {} as EnumResult<T>;
  options.forEach((item) => {
    result[item.enumName as K] = item.value;
  });
  return result;
}
