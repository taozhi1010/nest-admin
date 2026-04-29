import request from '@/composables/useRequest'

// 查询专栏列表
export function listSubject(query) {
  return request({
    url: '/post/subject/list',
    method: 'get',
    params: query
  })
}

// 查询专栏详细
export function getSubject(subjectId) {
  return request({
    url: `/post/subject/${subjectId}`,
    method: 'get'
  })
}

// 新增专栏
export function addSubject(data) {
  return request({
    url: '/post/subject',
    method: 'post',
    data: data
  })
}

// 修改专栏
export function updateSubject(data) {
  return request({
    url: '/post/subject',
    method: 'put',
    data: data
  })
}

// 删除专栏
export function delSubject(subjectId) {
  return request({
    url: `/post/subject/${subjectId}`,
    method: 'delete'
  })
}
