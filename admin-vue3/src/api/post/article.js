import request from '@/composables/useRequest'

// 查询文章列表
export function listArticle(query) {
  return request({
    url: '/post/article/list',
    method: 'get',
    params: query
  })
}

// 查询文章详细
export function getArticle(id) {
  return request({
    url: `/post/article/${id}`,
    method: 'get'
  })
}

// 新增文章
export function addArticle(data) {
  return request({
    url: '/post/article',
    method: 'post',
    data: data
  })
}

// 修改文章
export function updateArticle(data) {
  return request({
    url: '/post/article',
    method: 'put',
    data: data
  })
}

// 删除文章
export function delArticle(id) {
  return request({
    url: `/post/article/${id}`,
    method: 'delete'
  })
}

// 提交审核
export function submitAudit(id) {
  return request({
    url: `/post/article/submitAudit/${id}`,
    method: 'post'
  })
}

// 审核文章
export function auditArticle(data) {
  return request({
    url: '/post/article/audit',
    method: 'post',
    data: data
  })
}

// 发布文章
export function publishArticle(id) {
  return request({
    url: `/post/article/publish/${id}`,
    method: 'post'
  })
}
