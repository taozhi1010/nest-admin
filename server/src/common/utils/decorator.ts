import { get } from 'lodash';

const stringFormat = (str: string, callback: (key: string) => string): string => {
  return str.replace(/\{([^}]+)\}/g, (word, key) => callback(key));
};

/**
 * 判断 token 是否为参数索引语法（如 "0", "0.userId", "1.deptId"）
 */
function isIndexToken(token: string): boolean {
  return /^\d+(\..+)?$/.test(token);
}

/**
 * 根据格式化字符串和参数列表生成缓存 key。
 *
 * 支持两种语法：
 *   1. 参数索引（推荐，生产压缩后仍可用）：{0}、{0.userId}、{1.deptId}
 *   2. 对象属性路径（向后兼容）：{updateUserDto.userId}、{configKey}
 *      —— 遍历 args 查找匹配属性，不依赖函数 toString() 解析
 *
 * 注意：纯基本类型参数（如 userId: number）必须使用索引语法 {0}，
 *       因为旧版本依赖 func.toString() 解析参数名，在生产构建压缩后会失效。
 *
 * @param formatKey 格式化字符串，如 'findOne:{0}' 或 '{0.userId}-{1}'
 * @param args 方法参数数组
 * @returns 格式化后的 key；若任一占位符解析失败则返回 null
 */
export function paramsKeyFormat(formatKey: string, args: any[]): string | null {
  let isNotGet = false;

  const key = stringFormat(formatKey, (token) => {
    // 1. 优先按索引解析：{0}、{0.userId}
    if (isIndexToken(token)) {
      const dotIndex = token.indexOf('.');
      const argIndex = parseInt(dotIndex === -1 ? token : token.slice(0, dotIndex), 10);
      const path = dotIndex === -1 ? undefined : token.slice(dotIndex + 1);
      const value = path ? get(args[argIndex], path) : args[argIndex];
      if (value === undefined || value === null) {
        isNotGet = true;
        return '';
      }
      return String(value);
    }

    // 2. 按对象属性路径解析：{updateUserDto.userId}、{configKey}
    //    遍历所有对象参数查找匹配属性，不依赖函数 toString()
    for (const arg of args) {
      if (arg && typeof arg === 'object') {
        const value = get(arg, token);
        if (value !== undefined && value !== null) {
          return String(value);
        }
      }
    }

    isNotGet = true;
    return '';
  });

  if (isNotGet) return null;
  return key;
}

/**
 * 根据格式化字符串从参数列表中取出对象。
 *
 * @param args 方法参数数组
 * @param formatKey 可选，支持：
 *   - 索引语法：'0' 表示第 0 个参数
 *   - 属性名：'user' 表示查找名为 user 的对象参数
 *   - 未提供：返回第一个对象参数
 */
export function paramsKeyGetObj(args: any[], formatKey?: string): any {
  if (!formatKey) {
    return args.find((arg) => arg && typeof arg === 'object') || null;
  }

  // 索引语法
  if (/^\d+$/.test(formatKey)) {
    return args[parseInt(formatKey, 10)] || null;
  }

  // 按属性名查找
  for (const arg of args) {
    if (arg && typeof arg === 'object' && formatKey in arg) {
      return arg;
    }
  }

  // 兜底：第一个对象参数
  return args.find((arg) => arg && typeof arg === 'object') || null;
}
