import request from '@/composables/useRequest'

// 获取服务信息
export function getServer() {
  return request({
    url: '/monitor/server',
    method: 'get'
  })
}
