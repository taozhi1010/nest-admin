/**
 * 动态加载 SVG 图标
 * 自动扫描 assets/icons/svg 目录下的所有 SVG 文件
 */

const icons: string[] = []
const modules = import.meta.glob('./../../assets/icons/svg/*.svg')

for (const path in modules) {
  const p = path.split('assets/icons/svg/')[1].split('.svg')[0]
  icons.push(p)
}

export default icons
