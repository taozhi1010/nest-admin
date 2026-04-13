/**
 * 压缩插件配置
 * 
 * 功能说明：
 * 1. 支持 gzip 压缩
 * 2. 支持 brotli 压缩
 * 3. 根据环境变量配置选择压缩方式
 */
import compression from 'vite-plugin-compression'

/**
 * 创建压缩插件配置
 * @param {Object} env - 环境变量对象
 * @param {string} env.VITE_BUILD_COMPRESS - 压缩类型配置（gzip,brotli）
 * @returns {Array} 压缩插件数组
 */
export default function createCompression(env) {
  const { VITE_BUILD_COMPRESS } = env
  const plugin = []
  
  if (VITE_BUILD_COMPRESS) {
    const compressList = VITE_BUILD_COMPRESS.split(',')
    
    // 如果配置了 gzip 压缩
    if (compressList.includes('gzip')) {
      // http://doc.ruoyi.vip/ruoyi-vue/other/faq.html#使用gzip解压缩静态文件
      plugin.push(
        compression({
          ext: '.gz',           // 压缩文件扩展名
          deleteOriginFile: false // 不删除原始文件
        })
      )
    }
    
    // 如果配置了 brotli 压缩
    if (compressList.includes('brotli')) {
      plugin.push(
        compression({
          ext: '.br',              // 压缩文件扩展名
          algorithm: 'brotliCompress', // 使用 brotli 算法
          deleteOriginFile: false  // 不删除原始文件
        })
      )
    }
  }
  
  return plugin
}
