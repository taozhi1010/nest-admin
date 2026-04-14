/**
 * 处理主题样式
 * @param theme 主题颜色
 */
export function handleThemeStyle(theme: string): void {
  document.documentElement.style.setProperty('--el-color-primary', theme)
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-light-${i}`,
      getLightColor(theme, i / 10)
    )
  }
  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-dark-${i}`,
      getDarkColor(theme, i / 10)
    )
  }
}

/**
 * hex颜色转rgb颜色
 * @param str hex颜色字符串
 * @returns rgb数组
 */
export function hexToRgb(str: string): number[] {
  str = str.replace('#', '')
  const hexs = str.match(/../g) || []
  return hexs.map((hex) => parseInt(hex, 16))
}

/**
 * rgb颜色转Hex颜色
 * @param r 红色值
 * @param g 绿色值
 * @param b 蓝色值
 * @returns hex颜色字符串
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const hexs = [r.toString(16), g.toString(16), b.toString(16)]
  return `#${hexs.map((hex) => hex.padStart(2, '0')).join('')}`
}

/**
 * 变浅颜色值
 * @param color 颜色
 * @param level 变浅程度 (0-1)
 * @returns 变浅后的颜色
 */
export function getLightColor(color: string, level: number): string {
  const rgb = hexToRgb(color)
  const lightRgb = rgb.map((channel) =>
    Math.floor((255 - channel) * level + channel)
  )
  return rgbToHex(lightRgb[0], lightRgb[1], lightRgb[2])
}

/**
 * 变深颜色值
 * @param color 颜色
 * @param level 变深程度 (0-1)
 * @returns 变深后的颜色
 */
export function getDarkColor(color: string, level: number): string {
  const rgb = hexToRgb(color)
  const darkRgb = rgb.map((channel) => Math.floor(channel * (1 - level)))
  return rgbToHex(darkRgb[0], darkRgb[1], darkRgb[2])
}
