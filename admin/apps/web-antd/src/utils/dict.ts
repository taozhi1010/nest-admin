import { dictDataInfo } from '#/api/system/dict/dict-data';
import { useDictStore } from '#/store/dict';

/**
 * 抽取公共逻辑的基础方法
 * @param dictName 字典名称
 * @param dataGetter 获取字典数据的函数
 * @param formatNumber 是否格式化字典value为number类型
 * @returns 数据
 */
function fetchAndCacheDictData<T>(
  dictName: string,
  dataGetter: () => T[],
  formatNumber = false,
): T[] {
  const { dictRequestCache, setDictInfo } = useDictStore();
  // 有调用方决定如何获取数据
  const dataList = dataGetter();

  // 检查请求状态缓存
  if (dataList.length === 0 && !dictRequestCache.has(dictName)) {
    dictRequestCache.set(
      dictName,
      dictDataInfo(dictName)
        .then((resp) => {
          // 缓存到store 这样就不用重复获取了
          // 内部处理了push的逻辑 这里不用push
          setDictInfo(dictName, resp, formatNumber);
        })
        .finally(() => {
          // 移除请求状态缓存
          /**
           * 这里主要判断字典item为空的情况(无奈兼容 不给字典item本来就是错误用法)
           * 会导致if一直进入逻辑导致接口无限刷新
           * 在这里dictList为空时 不删除缓存
           */
          if (dataList.length > 0) {
            dictRequestCache.delete(dictName);
          }
        }),
    );
  }
  return dataList;
}

/**
 * 这里是提供给渲染标签使用的方法
 * @deprecated 使用getDictOptions代替 于下个版本删除
 * @param dictName 字典名称
 * @returns 字典信息
 */
export function getDict(dictName: string) {
  const { getDictOptions } = useDictStore();
  return fetchAndCacheDictData(dictName, () => getDictOptions(dictName));
}

/**
 * 一般是Select, Radio, Checkbox等组件使用
 * @param dictName 字典名称
 * @param formatNumber 是否格式化字典value为number类型
 * @returns Options数组
 */
export function getDictOptions(dictName: string, formatNumber = false) {
  const { getDictOptions } = useDictStore();
  return fetchAndCacheDictData(
    dictName,
    () => getDictOptions(dictName),
    formatNumber,
  );
}
