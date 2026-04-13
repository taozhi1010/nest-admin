
import cache from './cache'

export default function installPlugins(app) {
  // 缓存对象
  app.config.globalProperties.$cache = cache
}
