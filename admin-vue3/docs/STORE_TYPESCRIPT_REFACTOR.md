# Store 模块 TypeScript 化完成报告

## 概述

已将 `src/store` 目录下的所有 Pinia Store 文件从 JavaScript 转换为 TypeScript，提供完整的类型安全和更好的开发体验。

## 改动文件

### 1. store/index.ts（原 index.js）
**文件路径**: `src/store/index.ts`

**主要改进**:
- ✅ 添加 `createPinia` 的类型导入
- ✅ 明确的返回值类型推断

### 2. app.ts（原 app.js）
**文件路径**: `src/store/modules/app.ts`

**主要改进**:
- ✅ 定义 `SidebarState` 和 `AppState` 接口
- ✅ state 函数返回类型标注：`() => AppState`
- ✅ 所有 actions 参数类型标注
- ✅ 使用非空断言操作符处理 Cookies 返回值

**类型定义**:
```typescript
interface SidebarState {
  opened: boolean
  withoutAnimation: boolean
  hide: boolean
}

interface AppState {
  sidebar: SidebarState
  device: string
  size: string
}
```

### 3. settings.ts（原 settings.js）
**文件路径**: `src/store/modules/settings.ts`

**主要改进**:
- ✅ 定义 `LayoutSetting` 和 `SettingsState` 接口
- ✅ localStorage 解析的类型安全处理
- ✅ `changeSetting` 方法使用 `keyof SettingsState` 确保类型安全

**类型定义**:
```typescript
interface LayoutSetting {
  theme?: string
  sideTheme?: string
  topNav?: boolean
  tagsView?: boolean
  fixedHeader?: boolean
  sidebarLogo?: boolean
  dynamicTitle?: boolean
}

interface SettingsState {
  title: string
  theme: string
  sideTheme: string
  showSettings: boolean
  topNav: boolean
  tagsView: boolean
  fixedHeader: boolean
  sidebarLogo: boolean
  dynamicTitle: boolean
}
```

### 4. user.ts（原 user.js）
**文件路径**: `src/store/modules/user.ts`

**主要改进**:
- ✅ 定义 `UserInfo` 和 `UserState` 接口
- ✅ 将所有 Promise 改为 async/await 语法
- ✅ 明确的返回值类型：`Promise<void>` 和 `Promise<any>`
- ✅ 更好的错误处理

**类型定义**:
```typescript
interface UserInfo {
  username: string
  password: string
  code: string
  uuid: string
}

interface UserState {
  token: string
  name: string
  avatar: string
  roles: string[]
  permissions: string[]
}
```

### 5. tagsView.ts（原 tagsView.js）
**文件路径**: `src/store/modules/tagsView.ts`

**主要改进**:
- ✅ 定义 `TagView` 和 `TagsViewState` 接口
- ✅ 所有 view 参数类型标注为 `TagView`
- ✅ 返回值使用 Promise 包装的类型

**类型定义**:
```typescript
interface TagView {
  title?: string
  path: string
  name?: string
  meta: {
    title?: string
    noCache?: boolean
    affix?: boolean
    link?: string
  }
  params?: Record<string, string | string[]>
  query?: Record<string, string | string[]>
  hash?: string
  fullPath?: string
  matched?: any[]
  redirectedFrom?: any
}

interface TagsViewState {
  visitedViews: TagView[]
  cachedViews: string[]
  iframeViews: TagView[]
}
```

### 6. dict.ts（原 dict.js）
**文件路径**: `src/store/modules/dict.ts`

**主要改进**:
- ✅ 定义 `DictItem`、`DictData`、`RawDictItem` 接口
- ✅ Set 类型标注：`Set<string>`
- ✅ 所有方法参数和返回值类型标注
- ✅ 详细的 JSDoc 注释

**类型定义**:
```typescript
interface DictItem {
  label: string
  value: string
  elTagType?: string
  elTagClass?: string
}

interface DictData {
  key: string
  value: DictItem[]
}

interface RawDictItem {
  dictLabel: string
  dictValue: string
  listClass?: string
  cssClass?: string
  dictType?: string
  type?: string
}
```

### 7. permission.ts（原 permission.js）
**文件路径**: `src/store/modules/permission.ts`

**主要改进**:
- ✅ 定义 `AppRouteRecord` 和 `PermissionState` 接口
- ✅ 组件动态导入（避免循环依赖）
- ✅ 导出函数类型标注
- ✅ 路由过滤函数类型安全

**类型定义**:
```typescript
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
```

**导出函数**:
```typescript
export function filterDynamicRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[]
export const loadView = (view: string): (() => Promise<any>) | undefined
```

## 删除的文件

- ❌ `src/store/index.js`
- ❌ `src/store/modules/app.js`
- ❌ `src/store/modules/user.js`
- ❌ `src/store/modules/settings.js`
- ❌ `src/store/modules/tagsView.js`
- ❌ `src/store/modules/dict.js`
- ❌ `src/store/modules/permission.js`

## 类型安全特性

### 1. State 类型推断
```typescript
// ✅ TypeScript 知道 state 的所有属性和类型
const appStore = useAppStore()
appStore.sidebar.opened // boolean
appStore.device // string
appStore.size // string
```

### 2. Actions 参数验证
```typescript
// ✅ 编译时检查参数类型
appStore.toggleSideBar(true) // ✅ 正确
appStore.toggleSideBar('yes') // ❌ 类型错误

userStore.login({
  username: 'admin',
  password: '123456',
  code: 'abc',
  uuid: 'xxx'
}) // ✅ 所有必需字段都有类型检查
```

### 3. 返回值类型明确
```typescript
// ✅ 知道返回值的类型
const dict = dictStore.getDict('sys_user_sex') // DictItem[] | null
const isLoaded = dictStore.isTypeLoaded('sys_user_sex') // boolean
```

### 4. 字典数据类型安全
```typescript
// ✅ 字典项有明确的形状
interface DictItem {
  label: string
  value: string
  elTagType?: string
  elTagClass?: string
}

// 使用时 IDE 会提示可用的属性
dict.forEach(item => {
  item.label // ✅ 自动补全
  item.value // ✅ 自动补全
})
```

## 使用示例

### App Store
```typescript
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()

// 切换侧边栏
appStore.toggleSideBar(false)

// 设置设备类型
appStore.toggleDevice('mobile')

// 设置组件大小
appStore.setSize('small')
```

### User Store
```typescript
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// 登录
await userStore.login({
  username: 'admin',
  password: '123456',
  code: captchaCode,
  uuid: captchaUuid
})

// 获取用户信息
const userInfo = await userStore.getInfo()

// 退出登录
await userStore.logOut()
```

### Dict Store
```typescript
import { useDictStore } from '@/store/modules/dict'

const dictStore = useDictStore()

// 获取字典
const sexDict = dictStore.getDict('sys_user_sex')
if (sexDict) {
  sexDict.forEach(item => {
    console.log(item.label, item.value)
  })
}

// 加载单个字典
const dictData = await dictStore.loadDict('sys_normal_disable')

// 初始化所有字典
await dictStore.initDict()
```

## 优势总结

1. **完整的类型安全**
   - State、Actions、Getters 都有明确的类型
   - 编译时捕获类型错误
   - 减少运行时错误

2. **更好的 IDE 支持**
   - 智能代码补全
   - 参数提示
   - 跳转到定义

3. **更易维护**
   - 类型即文档
   - 重构更安全
   - 代码审查更容易

4. **与现代 Vue3 生态一致**
   - Pinia 官方推荐 TypeScript
   - 与 composables 风格统一
   - 符合项目整体技术栈

## 注意事项

1. **权限模块的组件导入**
   - 使用动态导入避免循环依赖
   - `Layout`、`ParentView`、`InnerLink` 改为异步组件

2. **字典模块的灵活性**
   - 支持多种后端返回格式
   - 有降级方案保证兼容性

3. **标签视图的路由类型**
   - 自定义 `TagView` 接口适配业务需求
   - 保留必要的路由属性

## 相关文件

- [useClipboard Composable](./USECLIPBOARD_USAGE.md)
- [Permission 指令 TypeScript 化](./PERMISSION_DIRECTIVE_TYPESCRIPT_REFACTOR.md)

---

**完成时间**: 2026-04-15  
**改动类型**: 破坏性更新（文件扩展名从 .js 改为 .ts）  
**影响范围**: 所有使用 Store 的组件（无需修改，类型兼容）
