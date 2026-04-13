/**
 * SVG 图标插件配置
 * 
 * 功能说明：
 * 1. 自动处理 SVG 图标文件
 * 2. 将 SVG 转换为 symbol 格式
 * 3. 支持按需加载和缓存优化
 */
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

/**
 * 创建 SVG 图标插件配置
 * @param {boolean} isBuild - 是否为生产构建
 * @returns {Function} SVG 图标插件实例
 */
export default function createSvgIcon(isBuild) {
  return createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons/svg')], // SVG 图标目录
    symbolId: 'icon-[dir]-[name]', // symbol ID 命名规则
    svgoOptions: isBuild // 仅在生产构建时启用 SVGO 优化
  })
}
