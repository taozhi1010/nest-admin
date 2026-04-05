import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 引入中文语言包

// 设置默认语言为中文
dayjs.locale('zh-cn')

/**
 * 通用js方法封装处理
 * Copyright (c) 2019 ruoyi
 */

// 日期格式化 - 使用 dayjs 替代原生 Date 处理
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }
  
  // 默认格式映射：将旧格式的占位符转换为 dayjs 格式
  const formatMap = {
    '{y}': 'YYYY',
    '{m}': 'MM',
    '{d}': 'DD',
    '{h}': 'HH',
    '{i}': 'mm',
    '{s}': 'ss',
    '{a}': 'ddd' // 星期几的中文表示需要特殊处理
  }
  
  let format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
  
  // 检查是否包含星期几的占位符 {a}
  const hasWeekday = format.includes('{a}')
  
  // 将旧格式转换为 dayjs 格式
  let dayjsFormat = format
  Object.keys(formatMap).forEach(key => {
    if (key !== '{a}') {
      dayjsFormat = dayjsFormat.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), formatMap[key])
    }
  })
  
  // 移除 {a} 占位符，稍后单独处理
  dayjsFormat = dayjsFormat.replace(/\{a\}/g, '')
  
  // 使用 dayjs 解析时间
  let dateObj
  if (typeof time === 'object') {
    dateObj = dayjs(time)
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time
        .replace(new RegExp(/-/gm), '/')
        .replace('T', ' ')
        .replace(new RegExp(/\.[\d]{3}/gm), '')
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    dateObj = dayjs(time)
  }
  
  // 如果日期无效，返回 null
  if (!dateObj.isValid()) {
    return null
  }
  
  // 格式化时间
  let result = dateObj.format(dayjsFormat)
  
  // 如果需要处理星期几 {a}
  if (hasWeekday) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdays[dateObj.day()]
    // 先替换其他占位符
    let tempResult = format
    Object.keys(formatMap).forEach(key => {
      if (key !== '{a}') {
        const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g')
        tempResult = tempResult.replace(regex, dateObj.format(formatMap[key]))
      }
    })
    // 最后替换星期几占位符
    result = tempResult.replace(/\{a\}/g, weekday)
  }
  
  return result
}

// 添加日期范围
export function addDateRange(params, dateRange, propName) {
  let search = params
  search.params = typeof search.params === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {}
  dateRange = Array.isArray(dateRange) ? dateRange : []
  if (typeof propName === 'undefined') {
    search.params['beginTime'] = dateRange[0]
    search.params['endTime'] = dateRange[1]
  } else {
    search.params[`begin${propName}`] = dateRange[0]
    search.params[`end${propName}`] = dateRange[1]
  }
  return search
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments,
    flag = true,
    i = 1
  str = str.replace(/%s/g, function () {
    var arg = args[i++]
    if (typeof arg === 'undefined') {
      flag = false
      return ''
    }
    return arg
  })
  return flag ? str : ''
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str) {
  if (!str || str == 'undefined' || str == 'null') {
    return ''
  }
  return str
}

// 数据合并
export function mergeRecursive(source, target) {
  for (var p in target) {
    try {
      if (target[p].constructor == Object) {
        source[p] = mergeRecursive(source[p], target[p])
      } else {
        source[p] = target[p]
      }
    } catch (e) {
      source[p] = target[p]
    }
  }
  return source
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data, id, parentId, children) {
  let config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  }

  var childrenListMap = {}
  var nodeIds = {}
  var tree = []

  for (let d of data) {
    let parentId = d[config.parentId]
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = []
    }
    nodeIds[d[config.id]] = d
    childrenListMap[parentId].push(d)
  }

  for (let d of data) {
    let parentId = d[config.parentId]
    if (nodeIds[parentId] == null) {
      tree.push(d)
    }
  }

  for (let t of tree) {
    adaptToChildrenList(t)
  }

  function adaptToChildrenList(o) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]]
    }
    if (o[config.childrenList]) {
      for (let c of o[config.childrenList]) {
        adaptToChildrenList(c)
      }
    }
  }
  return tree
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    var part = `${encodeURIComponent(propName)}=`
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            let params = `${propName}[${key}]`
            var subPart = `${encodeURIComponent(params)}=`
            result += `${subPart + encodeURIComponent(value[key])}&`
          }
        }
      } else {
        result += `${part + encodeURIComponent(value)}&`
      }
    }
  }
  return result
}

// 返回项目路径
export function getNormalPath(p) {
  if (p.length === 0 || !p || p == 'undefined') {
    return p
  }
  let res = p.replace('//', '/')
  if (res[res.length - 1] === '/') {
    return res.slice(0, res.length - 1)
  }
  return res
}

// 验证是否为blob格式
export function blobValidate(data) {
  return data.type !== 'application/json'
}
