import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import cache from '@/utils/cache'
import { saveAs } from 'file-saver'
import useUserStore from '@/store/modules/user'
import { isValidBlob } from './useValidator'

// ==================== 类型定义 ====================

interface RequestConfig extends InternalAxiosRequestConfig {
  isToken?: boolean
  repeatSubmit?: boolean
  showMsg?: boolean
}

interface SessionObj {
  url: string
  data: string
  time: number
}

interface DownloadConfig {
  transformRequest?: Array<(data: any) => string>
  headers?: Record<string, string>
  responseType?: 'blob' | 'arraybuffer'
}

// 是否显示重新登录
export let isRelogin = { show: false }

// ==================== 工具函数 ====================

/**
 * 将参数对象转换为查询字符串
 * 替代原 ruoyi.js 中的 tansParams 方法
 * @param params 参数对象
 * @returns 查询字符串（不带开头的 ?）
 */
function paramsToQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  // 递归处理嵌套结构
  const serialize = (obj: any, prefix = ''): void => {
    if (obj == null || obj === '') return
    
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => serialize(item, `${prefix}[${i}]`))
    } else if (typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof RegExp)) {
      Object.entries(obj).forEach(([key, val]) => serialize(val, prefix ? `${prefix}[${key}]` : key))
    } else {
      searchParams.append(prefix, String(obj))
    }
  }
  
  Object.entries(params).forEach(([key, value]) => serialize(value, key))
  return searchParams.toString()
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env.VITE_APP_BASE_API,
  timeout: 10000
})

// 设置默认请求头
service.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

// request 拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestConfig = config as RequestConfig
    
    // 是否需要设置 token
    const isToken = requestConfig.isToken === false
    // 是否需要防止数据重复提交
    const isRepeatSubmit = requestConfig.repeatSubmit === false
    
    if (getToken() && !isToken) {
      config.headers['Authorization'] = `Bearer ${getToken()}` // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    
    // 如果是 FormData 类型（文件上传），删除 Content-Type 让浏览器自动设置 multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = `${config.url}?${paramsToQueryString(config.params)}`
      // 移除末尾的 & 符号（如果有的话）
      if (url.endsWith('&')) {
        url = url.slice(0, -1)
      }
      config.params = {}
      config.url = url
    }
    
    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj: SessionObj = {
        url: config.url || '',
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : String(config.data || ''),
        time: Date.now()
      }
      
      const sessionObj = cache.session.getJSON('sessionObj') as SessionObj | null
      
      if (sessionObj === undefined || sessionObj === null) {
        cache.session.setJSON('sessionObj', requestObj)
      } else {
        const s_url = sessionObj.url // 请求地址
        const s_data = sessionObj.data // 请求数据
        const s_time = sessionObj.time // 请求时间
        const interval = 1000 // 间隔时间(ms)，小于此时间视为重复提交
        
        if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
          const message = '数据正在处理，请勿重复提交'
          console.warn(`[${s_url}]: ${message}`)
          return Promise.reject(new Error(message))
        } else {
          cache.session.setJSON('sessionObj', requestObj)
        }
      }
    }
    
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (res: AxiosResponse) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // 获取错误信息
    const msg = errorCode[code as keyof typeof errorCode] || res.data.msg || errorCode['default']
    
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data
    }
    
    // 是否需要显示错误提示（默认显示）
    const requestConfig = res.config as RequestConfig
    const showMessage = requestConfig.showMsg !== false

    switch (code) {
      case 401:
        if (!isRelogin.show) {
          isRelogin.show = true
          ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', { 
            confirmButtonText: '重新登录', 
            cancelButtonText: '取消', 
            type: 'warning' 
          })
            .then(() => {
              isRelogin.show = false
              useUserStore()
                .logOut()
                .then(() => {
                  window.location.href = '/index'
                })
            })
            .catch(() => {
              isRelogin.show = false
            })
        }
        return Promise.reject('无效的会话，或者会话已过期，请重新登录。')

      case 500:
        if (showMessage) {
          ElMessage({ message: msg, type: 'error' })
        }
        return Promise.reject(new Error(msg))

      case 601:
        if (showMessage) {
          ElMessage({ message: msg, type: 'warning' })
        }
        return Promise.reject(new Error(msg))

      default:
        if (code !== 200) {
          if (showMessage) {
            ElNotification.error({ title: msg })
          }
          return Promise.reject('error')
        } else {
          return Promise.resolve(res.data)
        }
    }
  },
  (error) => {
    console.error('Request error:', error)
    let { message } = error
    
    if (message === 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      const statusCode = message.slice(-3)
      message = `系统接口${statusCode}异常`
    }
    
    ElMessage({ message, type: 'error', duration: 5000 })
    return Promise.reject(error)
  }
)

// 通用下载方法
export function download(url: string, params: any, filename: string, config?: DownloadConfig) {
  let downloadLoadingInstance: ReturnType<typeof ElLoading.service>
  downloadLoadingInstance = ElLoading.service({ text: '正在下载数据，请稍候', background: 'rgba(0, 0, 0, 0.7)' })
  
  return service
    .post(url, params, {
      transformRequest: [
        (params) => {
          return paramsToQueryString(params)
        }
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      ...config
    })
    .then(async (data: any) => {
      const isBlob = isValidBlob(data)
      if (isBlob) {
        const blob = new Blob([data])
        saveAs(blob, filename)
      } else {
        const resText = await data.text()
        const rspObj = JSON.parse(resText)
        const errMsg = errorCode[rspObj.code as keyof typeof errorCode] || rspObj.msg || errorCode['default']
        ElMessage.error(errMsg)
      }
      downloadLoadingInstance.close()
    })
    .catch((r) => {
      console.error(r)
      ElMessage.error('下载文件出现错误，请联系管理员！')
      downloadLoadingInstance.close()
    })
}

/**
 * HTTP 请求 Composable
 * @example
 * const { request, download } = useRequest()
 */
export function useRequest() {
  return {
    request: service,
    download
  }
}

export default service
