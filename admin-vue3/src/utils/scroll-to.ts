/**
 * 缓动函数：easeInOutQuad
 */
const easeInOutQuad = (t: number, b: number, c: number, d: number): number => {
  t /= d / 2
  if (t < 1) {
    return (c / 2) * t * t + b
  }
  t--
  return (-c / 2) * (t * (t - 2) - 1) + b
}

/**
 * requestAnimationFrame 兼容处理
 */
const requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    function (callback: FrameRequestCallback) {
      window.setTimeout(callback, 1000 / 60)
    }
  )
})()

/**
 * 滚动到指定位置
 * @param amount 滚动距离
 */
function move(amount: number): void {
  document.documentElement.scrollTop = amount
  ;(document.body.parentNode as HTMLElement).scrollTop = amount
  document.body.scrollTop = amount
}

/**
 * 获取当前滚动位置
 */
function position(): number {
  return (
    document.documentElement.scrollTop ||
    (document.body.parentNode as HTMLElement).scrollTop ||
    document.body.scrollTop
  )
}

/**
 * 平滑滚动到指定位置
 * @param to 目标位置
 * @param duration 滚动时长（毫秒）
 * @param callback 滚动完成回调
 */
export function scrollTo(to: number, duration: number = 500, callback?: () => void): void {
  const start = position()
  const change = to - start
  const increment = 20
  let currentTime = 0

  const animateScroll = () => {
    currentTime += increment
    const val = easeInOutQuad(currentTime, start, change, duration)
    move(val)

    if (currentTime < duration) {
      requestAnimFrame(animateScroll)
    } else {
      callback?.()
    }
  }

  animateScroll()
}
