/* eslint-disable @typescript-eslint/no-non-null-assertion */
interface TreeHelperConfig {
  children: string;
  id: string;
  pid: string;
}

type Fn = (node: any, parentNode?: any) => any;

// 默认配置
const DEFAULT_CONFIG: TreeHelperConfig = {
  id: 'id',
  pid: 'parentId',
  children: 'children',
};

// 获取配置。  Object.assign 从一个或多个源对象复制到目标对象
const getConfig = (config: Partial<TreeHelperConfig>) =>
  Object.assign({}, DEFAULT_CONFIG, config);

// tree from list
// 列表中的树
export function listToTree<T = any>(
  list: any[],
  config: Partial<TreeHelperConfig> = {},
): T[] {
  const conf = getConfig(config) as TreeHelperConfig;
  const nodeMap = new Map();
  const result: T[] = [];
  const { id, pid, children } = conf;

  for (const node of list) {
    node[children] = node[children] || [];
    nodeMap.set(node[id], node);
  }
  for (const node of list) {
    const parent = nodeMap.get(node[pid]);
    (parent ? parent[children] : result).push(node);
  }
  return result;
}

export function treeToList<T = any>(
  tree: any,
  config: Partial<TreeHelperConfig> = {},
): T {
  config = getConfig(config);
  const { children } = config;
  const result: any = [...tree];
  for (let i = 0; i < result.length; i++) {
    if (!result[i][children!]) continue;
    result.splice(i + 1, 0, ...result[i][children!]);
  }
  return result;
}

export function findNode<T = any>(
  tree: any,
  func: Fn,
  config: Partial<TreeHelperConfig> = {},
): null | T {
  config = getConfig(config);
  const { children } = config;
  const list = [...tree];
  for (const node of list) {
    if (func(node)) return node;
    node[children!] && list.push(...node[children!]);
  }
  return null;
}

export function findNodeAll<T = any>(
  tree: any,
  func: Fn,
  config: Partial<TreeHelperConfig> = {},
): T[] {
  config = getConfig(config);
  const { children } = config;
  const list = [...tree];
  const result: T[] = [];
  for (const node of list) {
    func(node) && result.push(node);
    node[children!] && list.push(...node[children!]);
  }
  return result;
}

export function findPath<T = any>(
  tree: any,
  func: Fn,
  config: Partial<TreeHelperConfig> = {},
): null | T | T[] {
  config = getConfig(config);
  const path: T[] = [];
  const list = [...tree];
  const visitedSet = new Set();
  const { children } = config;
  while (list.length > 0) {
    const node = list[0];
    if (visitedSet.has(node)) {
      path.pop();
      list.shift();
    } else {
      visitedSet.add(node);
      node[children!] && list.unshift(...node[children!]);
      path.push(node);
      if (func(node)) {
        return path;
      }
    }
  }
  return null;
}

export function findPathAll(
  tree: any,
  func: Fn,
  config: Partial<TreeHelperConfig> = {},
) {
  config = getConfig(config);
  const path: any[] = [];
  const list = [...tree];
  const result: any[] = [];
  const { children } = config;
  const visitedSet = new Set();
  while (list.length > 0) {
    const node = list[0];
    if (visitedSet.has(node)) {
      path.pop();
      list.shift();
    } else {
      visitedSet.add(node);
      node[children!] && list.unshift(...node[children!]);
      path.push(node);
      func(node) && result.push([...path]);
    }
  }
  return result;
}

export function filter<T = any>(
  tree: T[],
  func: (n: T) => boolean,
  // Partial 将 T 中的所有属性设为可选
  config: Partial<TreeHelperConfig> = {},
): T[] {
  // 获取配置
  config = getConfig(config);
  const children = config.children as string;

  function listFilter(list: T[]) {
    return list
      .map((node: any) => ({ ...node }))
      .filter((node) => {
        // 递归调用 对含有children项  进行再次调用自身函数 listFilter
        node[children] = node[children] && listFilter(node[children]);
        // 执行传入的回调 func 进行过滤
        return func(node) || (node[children] && node[children].length > 0);
      });
  }

  return listFilter(tree);
}

export function forEach<T = any>(
  tree: T[],
  func: (n: T) => any,
  config: Partial<TreeHelperConfig> = {},
): void {
  config = getConfig(config);
  const list: any[] = [...tree];
  const { children } = config;
  for (let i = 0; i < list.length; i++) {
    // func 返回true就终止遍历，避免大量节点场景下无意义循环，引起浏览器卡顿
    if (func(list[i])) {
      return;
    }
    children &&
      list[i][children] &&
      list.splice(i + 1, 0, ...list[i][children]);
  }
}

/**
 * @description: Extract tree specified structure
 * @description: 提取树指定结构
 */
export function treeMap<T = any>(
  treeData: T[],
  opt: { children?: string; conversion: Fn },
): T[] {
  return treeData.map((item) => treeMapEach(item, opt));
}

/**
 * @description: Extract tree specified structure
 * @description: 提取树指定结构
 */
export function treeMapEach(
  data: any,
  { conversion, children = 'children' }: { children?: string; conversion: Fn },
) {
  const haveChildren =
    Array.isArray(data[children]) && data[children].length > 0;
  const conversionData = conversion(data) || {};
  return haveChildren
    ? {
        ...conversionData,
        [children]: data[children].map((i: number) =>
          treeMapEach(i, {
            children,
            conversion,
          }),
        ),
      }
    : {
        ...conversionData,
      };
}

/**
 * 递归遍历树结构
 * @param treeDatas 树
 * @param callBack 回调
 * @param parentNode 父节点
 */
export function eachTree(treeDatas: any[], callBack: Fn, parentNode = {}) {
  treeDatas.forEach((element) => {
    const newNode = callBack(element, parentNode) || element;
    if (element.children) {
      eachTree(element.children, callBack, newNode);
    }
  });
}

// 如果节点的children为空, 则删除children属性
export function removeEmptyChildren(data: any[], childrenField = 'children') {
  data.forEach((item) => {
    if (!item[childrenField]) {
      return;
    }
    if (item[childrenField].length > 0) {
      removeEmptyChildren(item[childrenField]);
    } else {
      Reflect.deleteProperty(item, childrenField);
    }
  });
}

// eslint-disable-next-line jsdoc/require-returns-check
/**
 *
 * 添加全名 如 祖先节点-父节点-子节点
 * @param treeData 已经是tree数据
 * @param labelName 标签的字段名称
 * @param splitStr 分隔符
 * @returns void 无返回值 会修改原始数据
 */
export function addFullName(
  treeData: any[],
  labelName = 'label',
  splitStr = '-',
) {
  function addFullNameProperty(node: any, parentNames: any[] = []) {
    const fullNameParts = [...parentNames, node[labelName]];
    node.fullName = fullNameParts.join(splitStr);
    if (node.children && node.children.length > 0) {
      node.children.forEach((childNode: any) => {
        addFullNameProperty(childNode, fullNameParts);
      });
    }
  }

  treeData.forEach((item: any) => {
    addFullNameProperty(item);
  });
}

/**
 * https://blog.csdn.net/Web_J/article/details/129281329
 * 给出节点nodeId 找到所有父节点ID
 * @param treeList 树形结构list
 * @param nodeId 要寻找的节点ID
 * @param config config
 * @returns 父节点ID数组
 */
export function findParentsIds(
  treeList: any[],
  nodeId: number,
  config: Partial<TreeHelperConfig> = {},
) {
  const conf = getConfig(config) as TreeHelperConfig;
  const { id, children } = conf;

  // 用于存储所有父节点ID的数组
  const parentIds: number[] = [];

  function traverse(node: any, nodeId: number) {
    if (node[id] === nodeId) {
      return true;
    }
    if (node[children]) {
      // 如果当前节点有子节点，则继续遍历子节点
      for (const childNode of node[children]) {
        if (traverse(childNode, nodeId)) {
          // 如果在子节点中找到了子节点的父节点，则将当前节点的ID添加到父节点ID数组中，并返回true表示已经找到了子节点
          parentIds.push(node[id]);
          return true;
        }
      }
    }
    return false;
  }

  for (const node of treeList) {
    if (traverse(node, nodeId)) {
      // 如果在当前节点的子树中找到了子节点的父节点，则直接退出循环
      break;
    }
  }

  return parentIds.sort();
}

/**
 * 给出节点数组 找到所有父节点ID
 * @param treeList 树形结构list
 * @param nodeIds 要寻找的节点ID list
 * @param config config
 * @returns 父节点ID数组
 */
export function findGroupParentIds(
  treeList: any[],
  nodeIds: number[],
  config: Partial<TreeHelperConfig> = {},
) {
  // 用于存储所有父节点ID的Set 主要为了去重
  const parentIds = new Set<number>();

  nodeIds.forEach((nodeId) => {
    findParentsIds(treeList, nodeId, config).forEach((parentId) => {
      parentIds.add(parentId);
    });
  });

  return [...parentIds].sort();
}

/**
 * 找到所有ID 返回数组
 * @param treeList list
 * @param config
 * @returns ID数组
 */
export function findAllIds(
  treeList: any[],
  config: Partial<TreeHelperConfig> = DEFAULT_CONFIG,
) {
  const conf = getConfig(config) as TreeHelperConfig;
  const { id, children } = conf;
  const ids: number[] = [];

  treeList.forEach((item) => {
    if (item[children]) {
      const tempIds = findAllIds(item[children], config);
      ids.push(...tempIds);
    }
    ids.push(item[id]);
  });

  return [...ids].sort();
}

/**
 * @description 这里抄的filterByLevel函数
 * @description 主要用于获取指定层级的节点数组
 */
export function findIdsByLevel(
  level = 1,
  list?: any[],
  config: Partial<TreeHelperConfig> = DEFAULT_CONFIG,
  currentLevel = 1,
) {
  if (!level) {
    return [];
  }
  const res: (number | string)[] = [];
  const data = list || [];
  for (const item of data) {
    const { id: keyField, children: childrenField } = config;
    const key = keyField ? item[keyField] : '';
    const children = childrenField ? item[childrenField] : [];
    res.push(key);
    if (children && children.length > 0 && currentLevel < level) {
      currentLevel += 1;
      res.push(...findIdsByLevel(level, children, config, currentLevel));
    }
  }
  return res as number[] | string[];
}
