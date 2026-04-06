import request from '@/composables/useRequest'

// 获取路由
export const getRouters = () => {
  return request({
    url: '/getRouters',
    method: 'get'
  })
}
