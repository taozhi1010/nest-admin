import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { reactive } from 'vue'
import { getCodeImg } from '@/api/login'
import { useCatTools } from '@/composables/useCatTools'
import modal from '@/plugins/modal'
import type { ApiResponse } from '@/types/api'

// ==================== 类型定义 ====================

/**
 * 登录表单数据类型
 */
export interface LoginForm {
  username: string
  password: string
  rememberMe: boolean
  code?: string
  uuid?: string
}

/**
 * 验证码响应数据类型
 */
export interface CaptchaResponse {
  captchaEnabled: boolean
  uuid: string
  img: string
}

/**
 * 验证码信息接口
 */
export interface AuthCodeInfo {
  captchaEnabled: boolean // 验证码开关
  loading: boolean // 是否加载中
  refreshing: boolean // 是否正在刷新
  imgUrl: string // 验证码图片地址
  uuid: string // 验证码唯一标识
  gapTime: number // 刷新间隔时间（毫秒），默认 10 秒
}

/**
 * Cookie 数据接口
 */
interface CookieData {
  username?: string
  password?: string
  rememberMe?: string
}

// ==================== 状态管理 ====================

// 验证码相关信息
const authCodeInfo = reactive<AuthCodeInfo>({
  captchaEnabled: true, // 验证码开关
  loading: false, // 是否加载中
  refreshing: false, // 是否正在刷新
  imgUrl: '', // 验证码图片地址
  uuid: '', // 验证码唯一标识
  gapTime: 10000 // 刷新间隔时间（毫秒），默认 10 秒
})

// 记录上次刷新的时间戳
let lastRefreshTime = 0

// ==================== 核心函数 ====================

/**
 * 获取图片验证码
 * @param form - 登录表单数据
 * @param isClick - 是否点击触发
 * @returns Promise<void>
 */
const getValidateCode = async (form: LoginForm, isClick = false): Promise<void> => {
  const { isNullorUndefined } = useCatTools()

  try {
    // 检查是否正在加载
    if (authCodeInfo.loading || authCodeInfo.refreshing) {
      modal.msgWarning('正在请求验证码，请稍等')
      return
    }

    // 如果是点击触发，进行额外检查
    if (isClick) {
      // 检查用户名和密码是否为空
      if (isNullorUndefined(form.username)) {
        modal.msgError('请输入用户账号，否则无法刷新验证码')
        return
      }

      if (isNullorUndefined(form.password)) {
        modal.msgError('请输入用户密码，否则无法刷新验证码')
        return
      }

      // 检查刷新间隔
      const now = Date.now()
      if (lastRefreshTime > 0 && now - lastRefreshTime < authCodeInfo.gapTime) {
        const remainingSeconds = Math.ceil((authCodeInfo.gapTime - (now - lastRefreshTime)) / 1000)
        modal.msgWarning(`请 ${remainingSeconds} 秒后再刷新`)
        return
      }
    }

    // 如果是点击刷新，设置 refreshing 状态
    if (isClick && authCodeInfo.imgUrl) {
      authCodeInfo.refreshing = true
    }

    const responseData = (await getCodeImg()) as any
    // 后端返回格式: { code: 200, msg: '操作成功', data: { captchaEnabled, uuid, img } }
    const captchaData = responseData.data
    authCodeInfo.loading = true
    authCodeInfo.captchaEnabled = captchaData?.captchaEnabled === undefined ? true : captchaData.captchaEnabled
    authCodeInfo.uuid = captchaData?.uuid
    if (authCodeInfo.captchaEnabled) {
      authCodeInfo.imgUrl = captchaData?.img
      authCodeInfo.loading = false
      authCodeInfo.refreshing = false
      // 更新最后刷新时间
      if (isClick) {
        lastRefreshTime = Date.now()
      }
    } else {
      authCodeInfo.loading = false
      authCodeInfo.refreshing = false
    }
  } catch (err) {
    console.log('验证码获取错误:', err)
    authCodeInfo.refreshing = false
  }
}

/**
 * 从 Cookie 中获取登录用户信息
 * @param data - 默认表单数据
 * @returns 填充后的表单数据
 */
const getUserCookie = (data: LoginForm): LoginForm => {
  const { isNullorUndefined } = useCatTools()

  const cookieData: CookieData = {
    username: Cookies.get('username'),
    password: Cookies.get('password'),
    rememberMe: Cookies.get('rememberMe')
  }

  const form: LoginForm = {
    username: isNullorUndefined(cookieData.username) ? data.username : cookieData.username,
    password: isNullorUndefined(cookieData.password) ? data.password : decrypt(cookieData.password),
    rememberMe: isNullorUndefined(cookieData.rememberMe) ? false : Boolean(cookieData.rememberMe)
  }

  return form
}

/**
 * 在 Cookie 中保存用户信息
 * 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码，否则移除
 * @param data - 表单数据
 */
const setUserCookie = (data: LoginForm): void => {
  if (data.rememberMe) {
    Cookies.set('username', data.username, { expires: 30 })
    Cookies.set('password', encrypt(data.password), { expires: 30 })
    Cookies.set('rememberMe', String(data.rememberMe), { expires: 30 })
  } else {
    Cookies.remove('username')
    Cookies.remove('password')
    Cookies.remove('rememberMe')
  }
}

// ==================== 导出 ====================

export default {
  getValidateCode,
  getUserCookie,
  setUserCookie,
  authCodeInfo
}
