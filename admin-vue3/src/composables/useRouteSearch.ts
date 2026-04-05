import { ref, computed, watchEffect } from 'vue'
import Fuse from 'fuse.js'
import { getNormalPath } from '@/utils/ruoyi'
import { isHttp } from '@/utils/validate'
import usePermissionStore from '@/store/modules/permission'

// 路由搜索项接口
export interface RouteSearchItem {
  path: string
  title: string[]
  icon?: string
}

// 搜索结果接口
export interface FuseResult {
  item: RouteSearchItem
  refIndex: number
}

// 搜索配置接口
export interface SearchConfig {
  threshold?: number
  location?: number
  distance?: number
  minMatchCharLength?: number
}

// 搜索历史记录配置
const SEARCH_HISTORY_KEY = 'route-search-history'
const MAX_HISTORY_COUNT = 5
const ENABLE_SEARCH_HISTORY = false // 默认关闭历史记录

/**
 * 生成可搜索的路由列表
 */
function generateRoutes(routes: any[], basePath = '', prefixTitle: string[] = []): RouteSearchItem[] {
  let res: RouteSearchItem[] = []

  for (const r of routes) {
    // 跳过隐藏路由
    if (r.hidden) {
      continue
    }
    
    const p = r.path.length > 0 && r.path[0] === '/' ? r.path : `/${r.path}`
    const data: RouteSearchItem = {
      path: !isHttp(r.path) ? getNormalPath(basePath + p) : r.path,
      title: [...prefixTitle],
      icon: r.meta?.icon
    }

    if (r.meta && r.meta.title) {
      data.title = [...data.title, r.meta.title]

      if (r.redirect !== 'noRedirect') {
        res.push(data)
      }
    }

    // 递归处理子路由
    if (r.children) {
      const tempRoutes = generateRoutes(r.children, data.path, data.title)
      if (tempRoutes.length >= 1) {
        res = [...res, ...tempRoutes]
      }
    }
  }
  
  return res
}

/**
 * 初始化 Fuse.js 实例
 */
function initFuse(list: RouteSearchItem[], config?: SearchConfig): Fuse<RouteSearchItem> | undefined {
  if (!list || list.length === 0) {
    return undefined
  }
  
  return new Fuse(list, {
    shouldSort: true,
    threshold: config?.threshold ?? 0.4,
    location: config?.location ?? 0,
    distance: config?.distance ?? 100,
    minMatchCharLength: config?.minMatchCharLength ?? 1,
    keys: [
      {
        name: 'title',
        weight: 0.7
      },
      {
        name: 'path',
        weight: 0.3
      }
    ]
  })
}

/**
 * 获取搜索历史记录
 */
function getSearchHistory(): string[] {
  if (!ENABLE_SEARCH_HISTORY) return []
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

/**
 * 保存搜索历史记录
 */
function saveSearchHistory(query: string): void {
  if (!ENABLE_SEARCH_HISTORY) return
  if (!query || query.trim() === '') {
    return
  }
  
  try {
    const history = getSearchHistory()
    // 移除重复项
    const filtered = history.filter(item => item !== query)
    // 添加到开头
    filtered.unshift(query)
    // 限制数量
    const limited = filtered.slice(0, MAX_HISTORY_COUNT)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited))
  } catch {
    // 忽略错误
  }
}

/**
 * 清除搜索历史记录
 */
function clearSearchHistory(): void {
  localStorage.removeItem(SEARCH_HISTORY_KEY)
}

/**
 * 路由搜索 Composable
 */
export function useRouteSearch(config?: SearchConfig) {
  const permissionStore = usePermissionStore()
  
  // 响应式数据
  const query = ref('')
  const fuse = ref<Fuse<RouteSearchItem> | undefined>(undefined)
  const searchPool = ref<RouteSearchItem[]>([])
  const activeIndex = ref(0)
  const searchHistory = ref<string[]>([])
  
  // 计算属性
  const routes = computed(() => permissionStore.routes)
  
  // 搜索结果
  const results = computed<FuseResult[]>(() => {
    if (!query.value || query.value.trim() === '') {
      // 显示搜索历史
      return searchHistory.value.map(text => ({
        item: { path: '', title: [text], icon: 'time' },
        refIndex: 0
      }))
    }
    
    if (!fuse.value) {
      return []
    }
    
    return fuse.value.search(query.value)
  })
  
  // 是否有结果
  const hasResults = computed(() => {
    return results.value.length > 0
  })
  
  // 是否为空搜索（有查询但无结果）
  const isEmptySearch = computed(() => {
    return query.value && query.value.trim() !== '' && results.value.length === 0
  })
  
  /**
   * 初始化路由搜索池
   */
  function initSearchPool() {
    searchPool.value = generateRoutes(routes.value)
    fuse.value = initFuse(searchPool.value, config)
    searchHistory.value = getSearchHistory()
  }
  
  /**
   * 执行搜索
   */
  function handleSearch() {
    if (query.value && query.value.trim() !== '') {
      saveSearchHistory(query.value)
      searchHistory.value = getSearchHistory()
    }
    activeIndex.value = 0
  }
  
  /**
   * 重置搜索
   */
  function resetSearch() {
    query.value = ''
    activeIndex.value = 0
  }
  
  /**
   * 导航到下一个结果
   */
  function navigateDown() {
    if (results.value.length > 0) {
      activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
    }
  }
  
  /**
   * 导航到上一个结果
   */
  function navigateUp() {
    if (results.value.length > 0) {
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
    }
  }
  
  /**
   * 选择当前高亮的结果
   */
  function selectCurrentResult(): RouteSearchItem | null {
    if (results.value.length === 0) {
      return null
    }
    
    const result = results.value[activeIndex.value]
    if (!result) {
      return null
    }
    
    // 保存搜索历史
    if (query.value && query.value.trim() !== '') {
      saveSearchHistory(query.value)
    }
    
    return result.item
  }
  
  // 监听路由变化
  watchEffect(() => {
    initSearchPool()
  })
  
  return {
    // 状态
    query,
    results,
    activeIndex,
    searchHistory,
    hasResults,
    isEmptySearch,
    
    // 方法
    initSearchPool,
    handleSearch,
    resetSearch,
    navigateDown,
    navigateUp,
    selectCurrentResult,
    clearSearchHistory
  }
}
