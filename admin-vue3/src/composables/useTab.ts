import useTagsViewStore from '@/store/modules/tagsView'
import router from '@/router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { TagView } from '@/store/modules/tagsView'

/**
 * Tab 标签页操作 Composable
 * @example
 * const { closePage, refreshPage } = useTab()
 */
export function useTab() {
  /**
   * 将路由对象转换为 TagView 格式
   */
  const convertToTagView = (route: RouteLocationNormalizedLoaded): TagView => {
    return {
      ...route,
      name: typeof route.name === 'string' ? route.name : undefined
    }
  }
  /**
   * 刷新当前tab页签
   * @param {Object} obj - 可选，指定要刷新的页签对象
   */
  const refreshPage = (obj?: any) => {
    const { path, query, matched } = router.currentRoute.value
    if (obj === undefined) {
      matched.forEach((m) => {
        if (m.components && m.components.default && m.components.default.name) {
          if (!['Layout', 'ParentView'].includes(m.components.default.name)) {
            obj = { name: m.components.default.name, path: path, query: query }
          }
        }
      })
    }
    return useTagsViewStore()
      .delCachedView(obj)
      .then(() => {
        const { path, query } = obj
        router.replace({
          path: `/redirect${path}`,
          query: query
        })
      })
  }

  /**
   * 关闭当前tab页签，打开新页签
   * @param {Object} obj - 要打开的新页签对象
   */
  const closeOpenPage = (obj?: any) => {
    useTagsViewStore().delView(convertToTagView(router.currentRoute.value))
    if (obj !== undefined) {
      return router.push(obj)
    }
  }

  /**
   * 关闭指定tab页签
   * @param {Object} obj - 可选，指定要关闭的页签对象
   */
  const closePage = (obj?: any) => {
    if (obj === undefined) {
      return useTagsViewStore()
        .delView(convertToTagView(router.currentRoute.value))
        .then((result: any) => {
          const latestView = result.visitedViews.slice(-1)[0]
          if (latestView) {
            return router.push(latestView.fullPath)
          }
          return router.push('/')
        })
    }
    return useTagsViewStore().delView(obj)
  }

  /**
   * 关闭所有tab页签
   */
  const closeAllPage = () => {
    return useTagsViewStore().delAllViews(undefined as any)
  }

  /**
   * 关闭左侧tab页签
   * @param {Object} obj - 可选，参考页签对象
   */
  const closeLeftPage = (obj?: any) => {
    return useTagsViewStore().delLeftTags(obj ? obj : convertToTagView(router.currentRoute.value))
  }

  /**
   * 关闭右侧tab页签
   * @param {Object} obj - 可选，参考页签对象
   */
  const closeRightPage = (obj?: any) => {
    return useTagsViewStore().delRightTags(obj ? obj : convertToTagView(router.currentRoute.value))
  }

  /**
   * 关闭其他tab页签
   * @param {Object} obj - 可选，保留的页签对象
   */
  const closeOtherPage = (obj?: any) => {
    return useTagsViewStore().delOthersViews(obj ? obj : convertToTagView(router.currentRoute.value))
  }

  /**
   * 打开tab页签
   * @param {String} url - 要打开的路由地址
   */
  const openPage = (url) => {
    return router.push(url)
  }

  /**
   * 修改tab页签
   * @param {Object} obj - 要更新的页签对象
   */
  const updatePage = (obj) => {
    return useTagsViewStore().updateVisitedView(obj)
  }

  return {
    refreshPage,
    closeOpenPage,
    closePage,
    closeAllPage,
    closeLeftPage,
    closeRightPage,
    closeOtherPage,
    openPage,
    updatePage
  }
}
