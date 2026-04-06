# useRequest Composable 使用说明

## 概述

`useRequest` 是一个基于 TypeScript 重构的 HTTP 请求组合式函数，提供了类型安全的 API 调用和下载功能。

## 主要特性

- ✅ 完全 TypeScript 支持
- ✅ 自动 token 管理
- ✅ 请求/响应拦截器
- ✅ 重复提交防护
- ✅ 错误处理机制
- ✅ 文件下载功能
- ✅ 自动导入支持

## 使用方法

### 1. 基本用法

```typescript
import { useRequest } from '@/composables/useRequest'

// 在组件中使用
const { request, download } = useRequest()

// 发送 GET 请求
const getData = async () => {
  try {
    const response = await request({
      url: '/api/data',
      method: 'get'
    })
    console.log(response)
  } catch (error) {
    console.error('请求失败:', error)
  }
}

// 发送 POST 请求
const postData = async (data: any) => {
  try {
    const response = await request({
      url: '/api/data',
      method: 'post',
      data: data
    })
    return response
  } catch (error) {
    console.error('请求失败:', error)
  }
}
```

### 2. 文件下载

```typescript
const handleDownload = () => {
  download('/api/export', params, 'filename.xlsx')
}
```

### 3. 自定义配置

```typescript
// 不需要 token 的请求
request({
  url: '/public-api',
  method: 'get',
  headers: {
    isToken: false
  }
})

// 禁用重复提交检查
request({
  url: '/api/submit',
  method: 'post',
  headers: {
    repeatSubmit: false
  },
  data: formData
})

// 禁用错误提示
request({
  url: '/api/data',
  method: 'get',
  showMsg: false
})
```

## API 接口

### useRequest()

返回对象包含：
- `request`: Axios 实例，用于发送 HTTP 请求
- `download`: 文件下载函数

### RequestConfig 扩展属性

```typescript
interface RequestConfig extends AxiosRequestConfig {
  isToken?: boolean      // 是否需要 token，默认 true
  repeatSubmit?: boolean // 是否检查重复提交，默认 true
  showMsg?: boolean     // 是否显示错误消息，默认 true
}
```

### download 函数

```typescript
function download(
  url: string,           // 下载接口地址
  params: any,          // 请求参数
  filename: string,     // 文件名
  config?: DownloadConfig // 额外配置
): Promise<void>
```

## 迁移指南

### 从旧的 request.js 迁移

**之前：**
```javascript
import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params
  })
}
```

**现在：**
```typescript
import request from '@/composables/useRequest'

export function getUserList(params) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params
  })
}
```

或者使用 composable 方式：

```typescript
import { useRequest } from '@/composables/useRequest'

export function useUserApi() {
  const { request } = useRequest()
  
  const getUserList = (params) => {
    return request({
      url: '/system/user/list',
      method: 'get',
      params
    })
  }
  
  return {
    getUserList
  }
}
```

## 注意事项

1. **自动导入**：`useRequest`、`download` 和 `isRelogin` 已配置为自动导入，无需手动 import
2. **类型安全**：所有 API 调用都享有完整的 TypeScript 类型检查
3. **向后兼容**：现有的 API 文件已更新为引用新的 TypeScript 版本
4. **错误处理**：统一的错误处理机制，可根据需要配置 `showMsg` 选项

## 测试

运行测试脚本验证功能：

```javascript
// 在浏览器控制台中运行
testUseRequest()
```

## 相关文件

- 源码：`src/composables/useRequest.ts`
- 配置：`vite/plugins/auto-import.js`
- 测试：`tests/test-useRequest.js`
