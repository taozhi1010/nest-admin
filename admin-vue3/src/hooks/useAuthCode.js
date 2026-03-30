import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { reactive } from 'vue'
import { getCodeImg } from '@/api/login'
import { useCatTools } from '@/composables/useCatTools'
import modal from '@/plugins/modal'


// 验证码相关信息
const authCodeInfo = reactive({
  captchaEnabled: true, // 验证码开关
  loading: false, // 是否加载中
  refreshing: false, // 是否正在刷新
  imgUrl: '', // 验证码图片地址
  uuid: '', // 验证码唯一标识
  gapTime: 10000 // 刷新间隔时间（毫秒），默认 10 秒
})

// 记录上次刷新的时间戳
let lastRefreshTime = 0

/**
 * 获取图片验证码
 * @param data 表单数据
 * @param isClick 是否点击触发
 */
const getValidateCode = async (form, isClick) => {
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

    const { data } = await getCodeImg()
    authCodeInfo.loading = true
    authCodeInfo.captchaEnabled = data.captchaEnabled === undefined ? true : data.captchaEnabled
    authCodeInfo.uuid = data.uuid
    if (authCodeInfo.captchaEnabled) {
      authCodeInfo.imgUrl = data.img
      authCodeInfo.loading = false
      authCodeInfo.refreshing = false
      // 更新最后刷新时间
      if (isClick) {
        lastRefreshTime = Date.now()
      }
    }
  } catch (err) {
    console.log('验证码获取错误:', err)
    authCodeInfo.refreshing = false
  }
}

// 从 cookie 中获取登录用户信息
const getUserCookie = (data) => {
  const { isNullorUndefined } = useCatTools()
  
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  const form = {
    username: isNullorUndefined(username) ? data.username : username,
    password: isNullorUndefined(password) ? data.password : decrypt(password),
    rememberMe: isNullorUndefined(rememberMe) ? false : Boolean(rememberMe)
  }
  return form
}

// 在Cookie中的记住用户信息,勾选了需要记住密码设置在 cookie 中设置记住用户名和密码，否则移除
const setUserCookie = (data) => {
  if (data.rememberMe) {
    Cookies.set('username', data.username, { expires: 30 })
    Cookies.set('password', encrypt(data.password), { expires: 30 })
    Cookies.set('rememberMe', data.rememberMe, { expires: 30 })
  } else {
    Cookies.remove('username')
    Cookies.remove('password')
    Cookies.remove('rememberMe')
  }
}

export default { getValidateCode, getUserCookie, setUserCookie, authCodeInfo }
