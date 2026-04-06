<template>
  <div class="login-bg">
    <div v-for="n in 5" :key="n"></div>
  </div>

  <div class="register">
    <el-form ref="registerRef" v-no-enter class="register-form" :model="registerForm.model" :rules="registerForm.rules">
      <h3 class="title">nest-admin后台管理系统</h3>
      <el-form-item prop="username">
        <el-input v-model="registerForm.model.username" auto-complete="off" placeholder="账号" size="large" type="text">
          <template #prefix><svg-icon class="el-input__icon input-icon" icon-class="user" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="registerForm.model.password" auto-complete="off" placeholder="密码" size="large" type="password" @keyup.enter="handleRegister">
          <template #prefix><svg-icon class="el-input__icon input-icon" icon-class="password" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input v-model="registerForm.model.confirmPassword" auto-complete="off" placeholder="确认密码" size="large" type="password" @keyup.enter="handleRegister">
          <template #prefix><svg-icon class="el-input__icon input-icon" icon-class="password" /></template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="authCodeInfo.captchaEnabled" prop="code">
        <el-input v-model="registerForm.model.code" auto-complete="off" placeholder="验证码" size="large" style="width: 63%" @keyup.enter="handleRegister">
          <template #prefix><svg-icon class="el-input__icon input-icon" icon-class="validCode" /></template>
        </el-input>
        <div class="register-code" @click="getValidateCode(registerForm.model, true)" v-html="authCodeInfo.imgUrl"></div>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button :loading="authCodeInfo.loading" size="large" style="width: 100%" type="primary" @click="handleRegister">
          <span v-if="!authCodeInfo.loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>Copyright © 2018-2024 nest-admin All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import { register } from '@/api/login'
import { authCodeInfo, getValidateCode } from '@/composables/useAuthCode'

const router = useRouter()
const registerRef = ref()

const equalToPassword = (rule, value, callback) => {
  if (registerForm.model.password !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerForm = reactive({
  model: {
    username: '',
    password: '',
    confirmPassword: '',
    code: '',
    uuid: ''
  },
  rules: {
    username: [
      { required: true, trigger: 'blur', message: '请输入您的账号' },
      { min: 2, max: 20, message: '用户账号长度必须介于 2 和 20 之间', trigger: 'blur' }
    ],
    password: [
      { required: true, trigger: 'blur', message: '请输入您的密码' },
      { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, trigger: 'blur', message: '请再次输入您的密码' },
      { required: true, validator: equalToPassword, trigger: 'blur' }
    ],
    code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
  }
})

const handleRegister = () => {
  registerRef.value.validate((valid) => {
    if (valid) {
      authCodeInfo.loading = true
      register(registerForm.model)
        .then(() => {
          const username = registerForm.model.username
          ElMessageBox.alert(`<font color='red'>恭喜你，您的账号 ${username} 注册成功！</font>`, '系统提示', {
            dangerouslyUseHTMLString: true,
            type: 'success'
          })
            .then(() => {
              router.push('/login')
            })
            .catch(() => {})
        })
        .catch(() => {
          // 重新获取验证码
          if (authCodeInfo.captchaEnabled) {
            getValidateCode(registerForm.model, true)
          }
        })
        .finally(() => {
          authCodeInfo.loading = false
        })
    }
  })
}

getValidateCode(registerForm.model, false)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/login.scss' as *;

.register {
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

.register-form {
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
.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.register-code {
  width: 35%;
  height: 48px;
  float: right;
  text-align: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-register-footer {
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
