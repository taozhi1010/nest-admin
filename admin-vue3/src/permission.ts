import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { NavigationGuardNext, RouteLocationNormalized, NavigationFailure } from 'vue-router'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/composables/useValidator'
import { isRelogin } from '@/composables/useRequest'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import useDictStore from '@/store/modules/dict'
import { setRouteLoading } from '@/composables/useRouteLoading'
import { ElMessage } from 'element-plus'

NProgress.configure({ showSpinner: false })

const whiteList: string[] = ['/login', '/register']

// 记录当前正在导航的目标路径
let navigatingToPath: string | null = null

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  NProgress.start()
  setRouteLoading(true) // 开始路由加载
  navigatingToPath = to.path // 记录目标路径
  
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title as string)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
      setRouteLoading(false)
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        try {
          await useUserStore().getInfo()
          isRelogin.show = false
          
          // 初始化字典数据 - 在用户登录后才加载字典
          const dictStore = useDictStore()
          if (dictStore && !dictStore.dict.length) {
            dictStore.initDict().catch((error: any) => {
              console.error('字典初始化失败:', error)
            })
          }
          
          const accessRoutes = await usePermissionStore().generateRoutes(useUserStore().roles)
          // 根据roles权限生成可访问的路由表
          accessRoutes.forEach((route: any) => {
            if (!isHttp(route.path)) {
              router.addRoute(route) // 动态添加可访问路由表
            }
          })
          next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
        } catch (err: any) {
          await useUserStore().logOut()
          ElMessage.error(err)
          next({ path: '/' })
          setRouteLoading(false)
        }
      } else {
        // 检查路由是否存在
        const matchedRoutes = router.getRoutes().filter(route => 
          route.path === to.path || 
          (to.matched.length > 0 && to.matched.some(m => m.path === route.path))
        )
        
        if (matchedRoutes.length === 0 && to.path !== '/404') {
          // 路由不存在，跳转到404页面
          NProgress.done()
          setRouteLoading(false)
          next('/404')
        } else {
          next()
        }
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
      setRouteLoading(false)
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
      setRouteLoading(false)
    }
  }
})

router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized, failure?: NavigationFailure | void) => {
  NProgress.done()
  setRouteLoading(false) // 结束路由加载
  
  // 清除导航状态
  const targetPath = navigatingToPath
  navigatingToPath = null
  
  // 如果导航失败，给出提示
  if (failure) {
    console.error('路由导航失败:', failure)
    // 如果是组件加载失败，跳转到错误页面
    if (
      (failure as any).type === 2 || 
      failure.message?.includes('Failed to fetch') || 
      failure.message?.includes('loading chunk')
    ) {
      ElMessage.error('页面加载失败，请刷新重试')
      // 可以选择跳转到错误页面或保持当前页面
      // router.push('/error').catch(() => {})
    }
  } else if (targetPath && to.path !== targetPath && to.path !== '/404') {
    // 如果导航成功但路径不匹配（可能被重定向），且不是404页面
    // 这种情况通常是正常的重定向，不需要提示
  }
})
