import request from '@/composables/useRequest'

// 查询字典数据列表
export function listData(query) {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData(dictCode) {
  return request({
    url: `/system/dict/data/${dictCode}`,
    method: 'get'
  })
}

// 根据字典类型查询字典数据信息
// fresh=true 时跳过后端 Redis 缓存，直接查询数据库
export function getDicts(dictType, fresh = false) {
  return request({
    url: `/system/dict/data/type/${dictType}`,
    method: 'get',
    params: fresh ? { fresh: true } : undefined
  })
}

// 新增字典数据
export function addData(data) {
  return request({
    url: '/system/dict/data',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData(data) {
  return request({
    url: '/system/dict/data',
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delData(dictCode) {
  return request({
    url: `/system/dict/data/${dictCode}`,
    method: 'delete'
  })
}

// 获取所有字典数据
// fresh=true 时跳过后端 Redis 缓存，直接查询数据库并重建缓存
export function getAllDicts(fresh = false) {
  return request({
    url: '/system/dict/data/all',
    method: 'get',
    params: fresh ? { fresh: true } : undefined
  })
}

// 获取字典版本号，用于校验本地持久化缓存是否过期
export function getDictVersion() {
  return request({
    url: '/system/dict/data/version',
    method: 'get',
    showMsg: false
  })
}
