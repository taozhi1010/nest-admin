import request from '@/utils/request'

// 查询游戏列表
export function listArticle(query) {
  return request({
    url: '/game/article/list',
    method: 'get',
    params: query
  })
}

// 查询游戏详细
export function getArticle(ArticleId) {
  return request({
    url: '/game/article/' + ArticleId,
    method: 'get'
  })
}

// 新增游戏
export function addArticle(data) {
  return request({
    url: '/game/article',
    method: 'post',
    data: data
  })
}

// 修改游戏
export function updateArticle(data) {
  return request({
    url: '/game/article',
    method: 'put',
    data: data
  })
}

// 删除游戏
export function delArticle(ArticleId) {
  return request({
    url: '/game/article/' + ArticleId,
    method: 'delete'
  })
}
