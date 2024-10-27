import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { getCodeImg } from '@/api/login'

// 验证码相关
const authCodeInfo = reactive({
  captchaEnabled: false, // 验证码开关
  loading: false, // 是否加载中
  imgUrl: '', // 验证码图片地址
  uuid: '' // 验证码唯一标识
})

// 获取图片验证码
const getValidateCode = async (loginForm) => {
  if (loginForm.username === '') {
    ElMessage.error('请输入用户账号')
    return
  }

  if (loginForm.password === '') {
    ElMessage.error('请输入用户密码')
    return
  }

  try {
    const result = await getCodeImg()
    authCodeInfo.loading = true
    authCodeInfo.captchaEnabled = result.captchaEnabled === undefined ? true : result.captchaEnabled
    if (authCodeInfo.captchaEnabled) {
      authCodeInfo.imgUrl = result.img
      authCodeInfo.uuid = result.uuid
      authCodeInfo.loading = false
    }
  } catch (err) {
    console.log('验证码获取错误:', err)
  }
}

export default { getValidateCode, authCodeInfo }
