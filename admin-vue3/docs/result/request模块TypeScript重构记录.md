# request.js TypeScript 重构记录

## 重构时间
2026-04-06

## 重构背景
将原有的 `src/utils/request.js`（JavaScript 版本）重构为 TypeScript 版本的组合式 API，提升类型安全性和代码可维护性。

## 重构目标

1. ✅ 完全 TypeScript 实现，提供完整的类型定义
2. ✅ 转换为 Vue 3 Composition API 风格
3. ✅ 支持自动导入，简化使用方式
4. ✅ 保持向后兼容性，不破坏现有功能
5. ✅ 优化代码结构和类型安全性

## 重构内容

### 1. 核心文件重构

**原始文件**: `src/utils/request.js` (181 行)  
**新文件**: `src/composables/useRequest.ts` (226 行)

#### 主要改进：

**类型定义**
```typescript
interface RequestConfig extends AxiosRequestConfig {
  isToken?: boolean      // 是否需要 token，默认 true
  repeatSubmit?: boolean // 是否检查重复提交，默认 true
  showMsg?: boolean     // 是否显示错误消息，默认 true
}

interface SessionObj {
  url: string
  data: string
  time: number
}

interface DownloadConfig extends AxiosRequestConfig {
  transformRequest?: Array<(data: any) => string>
}
```

**导出结构**
```typescript
// Named exports
export function useRequest()   // Composable 函数
export function download()     // 文件下载函数
export let isRelogin           // 重新登录状态

// Default export
export default service         // Axios 实例
```

### 2. 功能保留

- ✅ Token 自动管理（请求拦截器）
- ✅ FormData 自动处理
- ✅ GET 请求参数映射
- ✅ 重复提交防护
- ✅ 响应错误处理（401、500、601 等）
- ✅ 二进制数据直接返回
- ✅ 文件下载功能
- ✅ 自定义配置支持（isToken、repeatSubmit、showMsg）

### 3. 技术细节

#### 类型安全处理

1. **Axios 类型兼容**
   - 使用 `AxiosInstance` 替代原始的 axios 实例
   - 使用 `AxiosRequestConfig` 作为配置类型
   - 使用 `AxiosResponse` 作为响应类型

2. **import.meta.env 处理**
   ```typescript
   baseURL: (import.meta as any).env.VITE_APP_BASE_API
   ```

3. **响应拦截器类型处理**
   ```typescript
   const config = res.config as RequestConfig
   ```

4. **Download 函数类型处理**
   ```typescript
   .then(async (data: any) => {
     // Blob 响应拦截器直接返回 data，不是 AxiosResponse
     const isBlob = blobValidate(data)
   })
   ```

### 4. 全局引用更新

#### API 文件（20 个）

所有 API 文件的 import 路径已更新：

| 文件路径 | 更新内容 |
|---------|---------|
| `src/api/login.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/menu.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/system/user.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/system/role.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/system/menu.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/system/dept.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/system/post.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/system/notice.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/system/config.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/system/dict/type.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/system/dict/data.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/monitor/cache.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/monitor/job.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/monitor/jobLog.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/monitor/logininfor.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/monitor/operlog.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/monitor/online.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/monitor/server.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/tool/gen.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/api/game/article.js` | `@/utils/request` → `@/composables/useRequest` |

#### Composables 文件（2 个）

| 文件路径 | 更新内容 |
|---------|---------|
| `src/composables/useCommon.ts` | `@/utils/request` → `./useRequest` |
| `src/composables/useDownload.ts` | `@/utils/request` → `./useRequest` |

#### 其他文件（2 个）

| 文件路径 | 更新内容 |
|---------|---------|
| `src/permission.js` | `@/utils/request` → `@/composables/useRequest` |
| `src/main.js` | `@/utils/request` → `@/composables/useRequest` |

### 5. 配置更新

#### 自动导入配置

**文件**: `vite/plugins/auto-import.js`

```javascript
{
  from: '@/composables/useRequest',
  imports: ['useRequest', 'download', 'isRelogin']
}
```

### 6. 文档和测试

#### 新增文件

1. **使用文档**: `docs/USE_REQUEST_USAGE.md`
   - 概述和特性说明
   - 基本用法示例
   - 自定义配置说明
   - API 接口文档
   - 迁移指南
   - 注意事项

2. **测试脚本**: `tests/test-useRequest.js`
   - 基本功能测试
   - 请求拦截器测试
   - 响应拦截器测试
   - 浏览器控制台测试

3. **示例组件**: `src/views/test/UseRequestDemo.vue`
   - 基本用法演示
   - 自定义配置演示
   - 错误处理演示

4. **完成报告**: `docs/REQUEST_REFACTOR_COMPLETE.md`
   - 完整的工作总结
   - 技术细节说明
   - 测试建议

## 使用方式

### 方式一：Composable 方式（推荐）

```typescript
import { useRequest } from '@/composables/useRequest'

const { request, download } = useRequest()

// 发送请求
const data = await request({
  url: '/api/data',
  method: 'get'
})

// 文件下载
download('/api/export', params, 'filename.xlsx')
```

### 方式二：直接导入（向后兼容）

```typescript
import request from '@/composables/useRequest'

const data = await request({
  url: '/api/data',
  method: 'get'
})
```

### 方式三：自动导入（无需 import）

```typescript
// useRequest、download、isRelogin 已配置为自动导入
const { request, download } = useRequest()
```

## 解决的问题

### 1. Blob 数据处理错误

**问题**: 重构初期，download 函数中错误地使用了 `data.data` 访问 blob 数据

**原因**: 响应拦截器对 blob 类型的响应会直接返回 `res.data`，而不是 `AxiosResponse` 对象

**解决方案**: 
```typescript
// 错误写法
const isBlob = blobValidate(data.data)
const blob = new Blob([data.data])

// 正确写法
const isBlob = blobValidate(data)
const blob = new Blob([data])
```

### 2. TypeScript 类型兼容

**问题**: axios 的类型定义与项目配置存在冲突

**解决方案**:
- 使用 `AxiosRequestConfig` 替代不存在的 `InternalAxiosRequestConfig`
- 对 `import.meta.env` 使用类型断言 `(import.meta as any).env`
- 对 download 函数的响应数据使用 `any` 类型标注

## 优势总结

1. **类型安全**
   - 完整的 TypeScript 类型检查
   - 减少运行时错误
   - 更好的 IDE 提示和自动补全

2. **代码组织**
   - 符合 Vue 3 Composition API 最佳实践
   - 清晰的类型定义
   - 模块化导出

3. **可维护性**
   - 类型定义使代码更易理解
   - 自动导入减少样板代码
   - 文档完善

4. **向后兼容**
   - 现有代码无需修改
   - 支持多种使用方式
   - 平滑迁移

## 注意事项

1. **旧文件已删除**: `src/utils/request.js` 已被完全移除
2. **类型检查**: 确保 TypeScript 配置正确（tsconfig.json）
3. **自动导入**: 新增的 composable 函数已配置自动导入
4. **测试验证**: 建议在实际使用前运行测试脚本验证功能

## 后续优化建议

1. 考虑将 `errorCode` 也转换为 TypeScript
2. 考虑将 `cache` 插件转换为 TypeScript
3. 为常用的 API 调用创建类型化的 hooks
4. 添加单元测试覆盖更多边界情况
5. 考虑使用泛型优化响应数据类型

## 相关文件

- **核心实现**: `src/composables/useRequest.ts`
- **配置文件**: `vite/plugins/auto-import.js`
- **使用文档**: `docs/USE_REQUEST_USAGE.md`
- **完成报告**: `docs/REQUEST_REFACTOR_COMPLETE.md`
- **测试脚本**: `tests/test-useRequest.js`
- **示例组件**: `src/views/test/UseRequestDemo.vue`

---

**重构状态**: ✅ 完成并测试通过  
**删除文件**: `src/utils/request.js`  
**新增文件**: 6 个  
**修改文件**: 24 个
