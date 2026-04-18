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
export function getArticle(articleId) {
  return request({
    url: `/post/article/${articleId}`,
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
export function delArticle(articleId) {
  return request({
    url: `/post/article/${articleId}`,
    method: 'delete'
  })
}
