
import auth from './auth'
import cache from './cache'
import download from './download'

export default function installPlugins(app) {
  // 认证对象
  app.config.globalProperties.$auth = auth
  // 缓存对象
  app.config.globalProperties.$cache = cache
  // 下载文件
  app.config.globalProperties.$download = download
}
