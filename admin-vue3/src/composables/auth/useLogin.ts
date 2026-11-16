import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { getCodeImg } from '@/api/login'
import { isEmpty } from 'radash'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

/**
 * 登录表单相关逻辑
 * - 验证码：按账号获取验证码状态/图片，管理刷新状态
 * - 记住密码：登录信息的 Cookie 存取
 */

// ==================== 类型定义 ====================

/**
 * 登录表单数据类型
 */
export interface LoginForm {
  username: string
  password: string
  rememberMe: boolean
  code: string
  uuid: string
}

/**
 * 验证码状态
 */
export interface AuthCodeInfo {
  captchaEnabled: boolean // 后端按账号连续失败次数判断
  refreshing: boolean // 验证码图片是否正在刷新
  imgUrl: string // 验证码图片
  uuid: string // 验证码唯一标识
}

/**
 * 验证码接口返回数据
 */
interface CaptchaData {
  captchaEnabled?: boolean
  uuid?: string
  img?: string
}

// ==================== 登录状态 ====================

/** 登录按钮加载状态 */
export const loginLoading = ref(false)

// ==================== 验证码 ====================

export const authCodeInfo = reactive<AuthCodeInfo>({
  captchaEnabled: false,
  refreshing: false,
  imgUrl: '',
  uuid: ''
})

let fetching = false

/**
 * 获取验证码
 * @param form 表单模型（读取 username，成功后清空 code）
 * @param isClick 是否用户手动点击刷新
 * @param captchaType 验证码用途：login=按账号失败次数动态判断；register=注册验证码，无条件获取（不依赖账号）
 */
export const getValidateCode = async (
  form: Pick<LoginForm, 'username' | 'code'>,
  isClick = false,
  captchaType: 'login' | 'register' = 'login'
): Promise<void> => {
  if (fetching) return
  // 注册验证码不依赖账号，登录验证码需要账号判断是否启用
  if (captchaType === 'login' && isEmpty(form.username)) {
    authCodeInfo.captchaEnabled = false
    return
  }

  fetching = true
  if (isClick) authCodeInfo.refreshing = true
  try {
    // 返回格式: { code: 200, msg: '操作成功', data: { captchaEnabled, uuid, img } }
    const { data } = (await getCodeImg(form.username, captchaType)) as { data?: CaptchaData }
    authCodeInfo.captchaEnabled = Boolean(data?.captchaEnabled)
    authCodeInfo.uuid = data?.uuid || ''
    authCodeInfo.imgUrl = data?.img || ''
    // 新验证码与旧输入不匹配，清空避免误提交
    form.code = ''
  } catch (err) {
    console.error('验证码获取错误:', err)
    ElMessage.error('验证码状态获取失败，请稍后重试')
  } finally {
    fetching = false
    authCodeInfo.refreshing = false
  }
}

// ==================== 记住密码 ====================

const COOKIE_KEYS = ['username', 'password', 'rememberMe']

/**
 * 从 Cookie 中恢复登录信息
 */
export const getUserCookie = (data: LoginForm): Pick<LoginForm, 'username' | 'password' | 'rememberMe'> => {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')

  return {
    username: isEmpty(username) ? data.username : username,
    password: isEmpty(password) ? data.password : decrypt(password) || '',
    rememberMe: isEmpty(rememberMe) ? false : rememberMe === 'true'
  }
}

/**
 * 勾选记住密码时写入 Cookie，否则移除
 */
export const setUserCookie = (data: LoginForm): void => {
  if (!data.rememberMe) {
    COOKIE_KEYS.forEach((key) => Cookies.remove(key))
    return
  }
  Cookies.set('username', data.username, { expires: 30 })
  Cookies.set('password', encrypt(data.password), { expires: 30 })
  Cookies.set('rememberMe', String(data.rememberMe), { expires: 30 })
}
