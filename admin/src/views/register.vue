<template>
  <div class="login-bg">
    <div v-for="n in 5" :key="n" />
  </div>

  <div class="register">
    <el-form ref="registerRef" :model="registerForm.model" :rules="registerForm.rules" class="register-form">
      <h3 class="title">nest-admin后台管理系统</h3>
      <el-form-item prop="userName">
        <el-input v-model="registerForm.model.userName" type="text" size="large" auto-complete="off" placeholder="账号">
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="registerForm.model.password" type="password" size="large" auto-complete="off" placeholder="密码" @keyup.enter="handleRegister">
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input v-model="registerForm.model.confirmPassword" type="password" size="large" auto-complete="off" placeholder="确认密码" @keyup.enter="handleRegister">
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="authCodeInfo.captchaEnabled">
        <el-input size="large" v-model="registerForm.model.code" auto-complete="off" placeholder="验证码" style="width: 63%" @keyup.enter="handleRegister">
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code" v-html="authCodeInfo.imgUrl" @click="useAuthCode.getValidateCode(registerForm.model, true)"></div>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button :loading="authCodeInfo.loading" size="large" type="primary" style="width: 100%" @click="handleRegister">
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
import useAuthCode from '@/hooks/useAuthCode'
const authCodeInfo = useAuthCode.authCodeInfo

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
    userName: '',
    password: '',
    confirmPassword: '',
    code: '',
    uuid: ''
  },
  rules: {
    userName: [
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
          const userName = registerForm.model.userName
          ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + userName + ' 注册成功！</font>', '系统提示', {
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
            useAuthCode.getValidateCode(registerForm.model, true)
          }
        })
        .finally(() => {
          authCodeInfo.loading = false
        })
    }
  })
}

useAuthCode.getValidateCode(registerForm.model, false)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/login.scss';

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
