<template>
  <div class="login-bg">
    <div v-for="n in 5" :key="n"></div>
  </div>

  <div class="login">
    <el-form ref="loginRef" class="login-form" :model="loginForm.model" :rules="loginForm.rules">
      <h3 class="title">nest-admin后台管理系统</h3>
      <el-form-item prop="username">
        <el-input v-model.trim="loginForm.model.username" auto-complete="off" maxlength="10" placeholder="账号" size="large" type="text">
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

      <div class="login-tips">
        <el-checkbox v-model="loginForm.model.rememberMe" style="margin: 0px 0px 25px 0px">记住密码</el-checkbox>
        <el-link v-if="false" class="login-tips-link" href="/register" target="_blank" type="primary">去注册账号</el-link>
      </div>

      <el-form-item style="width: 100%">
        <el-button :loading="authCodeInfo.loading" size="large" style="width: 100%" type="primary" @click.prevent="handleLogin">
          <span v-if="!authCodeInfo.loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>

    <div class="el-login-footer">
      <span>Copyright © 2018-2024 nest-admin All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import useUserStore from '@/store/modules/user'
import useAuthCode from '@/hooks/useAuthCode'

const userStore = useUserStore()
const authCodeInfo = useAuthCode.authCodeInfo
const route = useRoute()
const router = useRouter()
const loginRef = ref()

const loginForm = reactive({
  model: {
    // TODO: 等后续开发完毕，我会删除这个配置
    username: 'admin', // 默认登录用户
    password: '123456', // 默认密码
    rememberMe: false,
    code: '',
    uuid: ''
  },
  rules: {
    username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
    password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
    code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
  }
})

const redirect = ref(undefined)

watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
  },
  { immediate: true }
)

function handleLogin() {
  loginRef.value.validate((valid) => {
    if (valid) {
      authCodeInfo.loading = true
      loginForm.model.uuid = authCodeInfo.uuid
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码，否则移除
      useAuthCode.setUserCookie(loginForm.model)

      // 调用 action 的登录方法
      userStore
        .login(loginForm.model)
        .then(() => {
          router.push({ path: redirect.value || '/' })
        })
        .catch(() => {
          // 重新获取验证码
          if (authCodeInfo.captchaEnabled) {
            useAuthCode.getValidateCode(loginForm.model, true)
          }
        })
        .finally(() => {
          authCodeInfo.loading = false
        })
    }
  })
}

// 刷新验证码
function handleRefreshCaptcha() {
  useAuthCode.getValidateCode(loginForm.model, true)
}

useAuthCode.getValidateCode(loginForm.model, false)
loginForm.model = useAuthCode.getUserCookie(loginForm.model)
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
  width: 400px;
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

.login-tips {
  &-link {
    position: relative;
    top: -3px;
    left: 10px;
    font-size: 13px;
  }
}
</style>
