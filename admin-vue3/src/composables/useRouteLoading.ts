// 路由加载状态
const routeLoading = ref(false)

// 设置路由加载状态
export function setRouteLoading(loading: boolean) {
  routeLoading.value = loading
}

// 获取路由加载状态
export function getRouteLoading() {
  return routeLoading.value
}

// 导出响应式引用，供组件直接使用
export { routeLoading }

export default {
  routeLoading,
  setRouteLoading,
  getRouteLoading
}
