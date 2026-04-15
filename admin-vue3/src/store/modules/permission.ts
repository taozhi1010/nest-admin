import { defineStore } from 'pinia'
import { useAuth } from '@/composables/useAuth'
import router, { constantRoutes, dynamicRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import type { RouteRecordRaw } from 'vue-router'

// 动态导入组件
const Layout = () => import('@/layout/index.vue')
const ParentView = () => import('@/components/ParentView/index.vue')
const InnerLink = () => import('@/layout/components/InnerLink/index.vue')

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

interface AppRouteRecord {
  path: string
  name?: string
  component?: any
  redirect?: string
  children?: AppRouteRecord[]
  meta?: any
  permissions?: string[]
  roles?: string[]
  [key: string]: any
}

interface PermissionState {
  routes: RouteRecordRaw[]
  addRoutes: RouteRecordRaw[]
  defaultRoutes: RouteRecordRaw[]
  topbarRouters: RouteRecordRaw[]
  sidebarRouters: RouteRecordRaw[]
}

const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: []
  }),
  actions: {
    setRoutes(routes: RouteRecordRaw[]) {
      this.addRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },
    setDefaultRoutes(routes: RouteRecordRaw[]) {
      this.defaultRoutes = constantRoutes.concat(routes)
    },
    setTopbarRoutes(routes: RouteRecordRaw[]) {
      this.topbarRouters = routes
    },
    setSidebarRouters(routes: RouteRecordRaw[]) {
      this.sidebarRouters = routes
    },
    generateRoutes(roles: string[]): Promise<RouteRecordRaw[]> {
      return new Promise((resolve) => {
        // 向后端请求路由数据
        getRouters().then((res) => {
          const sdata = JSON.parse(JSON.stringify(res.data))
          const rdata = JSON.parse(JSON.stringify(res.data))
          const defaultData = JSON.parse(JSON.stringify(res.data))
          const sidebarRoutes = filterAsyncRouter(sdata)
          const rewriteRoutes = filterAsyncRouter(rdata, false, true)
          const defaultRoutes = filterAsyncRouter(defaultData)
          const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
          asyncRoutes.forEach((route) => {
            router.addRoute(route)
          })
          this.setRoutes(rewriteRoutes)
          this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
          this.setDefaultRoutes(sidebarRoutes)
          this.setTopbarRoutes(defaultRoutes)
          resolve(rewriteRoutes)
        })
      })
    }
  }
})

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap: any[], lastRouter = false, type = false): RouteRecordRaw[] {
  return asyncRouterMap.filter((route) => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, false, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  }) as RouteRecordRaw[]
}

function filterChildren(childrenMap: any[], lastRouter: any = false): RouteRecordRaw[] {
  const children: RouteRecordRaw[] = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach((c) => {
          c.path = `${el.path}/${c.path}`
          if (c.children && c.children.length) {
            children.push(...filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = `${lastRouter.path}/${el.path}`
    }
    children.push(el)
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes: any[]): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = []
  const { hasPermiOr, hasRoleOr } = useAuth()
  routes.forEach((route) => {
    const appRoute = route as any
    if (appRoute.permissions) {
      if (hasPermiOr(appRoute.permissions)) {
        res.push(route)
      }
    } else if (appRoute.roles) {
      if (hasRoleOr(appRoute.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

export const loadView = (view: string): (() => Promise<any>) | undefined => {
  let res: (() => Promise<any>) | undefined
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0]
    if (dir === view) {
      res = () => (modules[path] as any)()
    }
  }
  return res
}

export default usePermissionStore
