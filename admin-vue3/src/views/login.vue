<template>
  <div class="login-bg">
    <div v-for="n in 5" :key="n"></div>
  </div>

  <div class="login">
    <el-form ref="loginRef" v-no-enter class="login-form" :model="loginForm.model" :rules="loginRules" :validate-on-rule-change="false">
      <h3 class="title">nest-admin后台管理系统</h3>
      <el-form-item prop="username">
        <el-input v-model.trim="loginForm.model.username" auto-complete="off" maxlength="50" placeholder="账号" size="large" type="text">
          <template #prefix>
            <user class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.model.password" auto-complete="off" maxlength="20" placeholder="密码" size="large" type="password" @keyup.enter="handleLogin">
          <template #prefix>
            <lock class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="authCodeInfo.captchaEnabled" prop="code">
        <div class="code-input-container">
          <el-input v-model.trim="loginForm.model.code" auto-complete="off" maxlength="3" placeholder="验证码" size="large" style="width: 63%" @keyup.enter="handleLogin">
            <template #prefix>
              <svg-icon class="input-icon" icon-class="validCode" />
            </template>
          </el-input>
          <captcha-code :img-url="authCodeInfo.imgUrl" :refreshing="authCodeInfo.refreshing" size="large" @refresh="handleRefreshCaptcha" />
        </div>
      </el-form-item>

      <div class="login-options">
        <el-checkbox v-model="loginForm.model.rememberMe" style="margin: 0px 0px 25px 0px">记住密码</el-checkbox>
        <el-link type="primary" style="margin: 0px 0px 25px 0px" @click="router.push('/register')">注册</el-link>
      </div>

      <el-form-item style="width: 100%">
        <el-button :loading="loginLoading" size="large" style="width: 100%" type="primary" @click.prevent="handleLogin">
          {{ loginLoading ? '登 录 中...' : '登 录' }}
        </el-button>
      </el-form-item>
    </el-form>

    <div class="el-login-footer">
      <span>Copyright © 2018-2024 nest-admin All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import useUserStore from '@/store/modules/user'
import { authCodeInfo, getValidateCode, getUserCookie, setUserCookie, loginLoading } from '@/composables/auth/useLogin'
import type { LoginForm } from '@/composables/auth/useLogin'
import type { FormInstance } from 'element-plus'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const loginRef = ref<FormInstance>()

const loginForm = reactive<{ model: LoginForm }>({
  model: {
    username: '',
    password: '',
    rememberMe: false,
    code: '',
    uuid: ''
  }
})

// 只有后端要求验证码时才校验
const loginRules = computed(() => ({
  username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
  ...(authCodeInfo.captchaEnabled ? { code: [{ required: true, trigger: 'change', message: '请输入验证码' }] } : {})
}))

// 登录成功后的跳转地址
const redirect = computed(() => (route.query.redirect as string) || '/')

// 登录处理（防抖防止连点，loading 防止请求期间回车重复提交）
const handleLogin = useDebounce(() => {
  if (loginLoading.value) return
  loginRef.value?.validate((valid) => {
    if (valid) {
      loginLoading.value = true
      loginForm.model.uuid = authCodeInfo.uuid
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码，否则移除
      setUserCookie(loginForm.model)

      // 调用 action 的登录方法
      userStore
        .login(loginForm.model)
        .then(() => {
          router.push({ path: redirect.value })
        })
        .catch(() => {
          // 登录失败后重新判断：连续失败达到阈值时会开始显示验证码
          getValidateCode(loginForm.model)
        })
        .finally(() => {
          loginLoading.value = false
        })
    }
  })
}, 500)

// 刷新验证码（防抖）
const handleRefreshCaptcha = useDebounce(() => {
  getValidateCode(loginForm.model, true)
}, 1000)

// 切换账号时重新判断该账号是否需要验证码
const debouncedCheckCaptcha = useDebounce(() => {
  getValidateCode(loginForm.model)
}, 500)

watch(
  () => loginForm.model.username,
  () => {
    if (loginForm.model.username) debouncedCheckCaptcha()
  }
)

// 先从cookie恢复用户信息，再按该账号的失败次数判断是否需要验证码
const userData = getUserCookie(loginForm.model)
Object.assign(loginForm.model, userData)
// 注册成功跳转回来时预填账号，优先于记住密码的 cookie
const queryUsername = route.query.username
if (typeof queryUsername === 'string' && queryUsername.trim()) {
  loginForm.model.username = queryUsername.trim()
}
getValidateCode(loginForm.model)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/login.scss' as *;

.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #f0f2f5;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 360px;
  padding: 25px 25px 5px 25px;

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 10px;
  }
}

.code-input-container {
  display: flex;
  gap: 2%; // 输入框和验证码之间的间距
  align-items: center; // 垂直居中对齐

  .el-input {
    flex: 1;
  }
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #909399;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
</style>
