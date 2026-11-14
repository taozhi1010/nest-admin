<template>
  <div class="login-bg">
    <div v-for="n in 5" :key="n"></div>
  </div>

  <div class="login">
    <el-form ref="registerRef" v-no-enter class="login-form" :model="registerForm" :rules="registerRules">
      <h3 class="title">nest-admin后台管理系统</h3>
      <el-form-item prop="username">
        <el-input v-model.trim="registerForm.username" auto-complete="off" maxlength="50" placeholder="账号" size="large" type="text">
          <template #prefix>
            <user class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="registerForm.password" auto-complete="new-password" maxlength="20" placeholder="密码" size="large" type="password" show-password @keyup.enter="handleRegister">
          <template #prefix>
            <lock class="input-icon" />
          </template>
        </el-input>
        <div v-if="registerForm.password" class="pwd-strength">
          <div class="pwd-strength-bars">
            <span :class="{ active: pwdStrength >= 1 }"></span>
            <span :class="{ active: pwdStrength >= 2 }"></span>
            <span :class="{ active: pwdStrength >= 3 }"></span>
          </div>
          <span class="pwd-strength-text" :class="`level-${pwdStrength}`">{{ pwdStrengthLabel }}</span>
        </div>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input v-model="registerForm.confirmPassword" auto-complete="new-password" maxlength="20" placeholder="确认密码" size="large" type="password" show-password @keyup.enter="handleRegister">
          <template #prefix>
            <lock class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <div class="code-input-container">
          <el-input v-model.trim="registerForm.code" auto-complete="off" maxlength="3" placeholder="验证码" size="large" style="width: 63%" @keyup.enter="handleRegister">
            <template #prefix>
              <svg-icon class="input-icon" icon-class="validCode" />
            </template>
          </el-input>
          <captcha-code :img-url="authCodeInfo.imgUrl" :refreshing="authCodeInfo.refreshing" size="large" @refresh="handleRefreshCaptcha" />
        </div>
      </el-form-item>

      <el-form-item style="width: 100%">
        <el-button :loading="registerLoading" size="large" style="width: 100%" type="primary" @click.prevent="handleRegister">
          {{ registerLoading ? '注 册 中...' : '注 册' }}
        </el-button>
      </el-form-item>
      <div class="go-login">
        <el-link type="primary" :underline="false" @click="router.push('/login')">使用已有账号登录</el-link>
      </div>
    </el-form>

    <div class="el-login-footer">
      <span>Copyright © 2018-2024 nest-admin All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { register } from '@/api/login'
import { authCodeInfo, getValidateCode } from '@/composables/auth/useLogin'
import { createRegisterRules, computePasswordStrength } from '@/composables/auth/useRegisterCheck'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const registerRef = ref<FormInstance>()
const registerLoading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  code: '',
  uuid: ''
})

// 密码变化时重新校验确认密码，避免陈旧的"两次密码不一致"提示残留
watch(
  () => registerForm.password,
  () => {
    if (registerForm.confirmPassword) {
      registerRef.value?.validateField('confirmPassword')
    }
  }
)

// 注册校验规则统一由 useRegisterCheck 维护（账号占用 + 密码强度 + 两次一致）
const registerRules = createRegisterRules(registerForm)

// 密码强度提示条：0=未输入 1=弱 2=中 3=强
const pwdStrength = computed(() => computePasswordStrength(registerForm.password))
const STRENGTH_LABELS = ['', '弱', '中', '强'] as const
const pwdStrengthLabel = computed(() => STRENGTH_LABELS[pwdStrength.value])

// 注册处理（防抖防止连点，loading 防止请求期间回车重复提交）
const handleRegister = useDebounce(() => {
  if (registerLoading.value) return
  registerRef.value?.validate((valid) => {
    if (valid) {
      registerLoading.value = true
      registerForm.uuid = authCodeInfo.uuid
      register(registerForm.username, registerForm.password, registerForm.code, registerForm.uuid)
        .then(() => {
          ElMessage.success('注册成功')
          // 跳转登录页并带上账号，由登录页读取 query 预填
          router.push({ path: '/login', query: { username: registerForm.username } })
        })
        .catch(() => {
          // 失败提示由请求拦截器统一展示（如"注册账号已存在"），验证码作废需刷新
          getValidateCode(registerForm, true, 'register')
        })
        .finally(() => {
          registerLoading.value = false
        })
    }
  })
}, 500)

// 刷新验证码（防抖）
const handleRefreshCaptcha = useDebounce(() => {
  getValidateCode(registerForm, true, 'register')
}, 1000)

// 注册验证码与账号无关，进入页面即获取
getValidateCode(registerForm, false, 'register')
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

  .go-login {
    margin: 0px 0px 15px 0px;
    text-align: right;
  }

  .code-input-container {
    display: flex;
    gap: 2%; // 输入框和验证码之间的间距
    align-items: center; // 垂直居中对齐

    .el-input {
      flex: 1;
    }
  }

  .pwd-strength {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;

    .pwd-strength-bars {
      flex: 1;
      display: flex;
      gap: 4px;

      span {
        height: 4px;
        flex: 1;
        border-radius: 2px;
        background: #e4e7ed;
        transition: background-color 0.3s;

        &:nth-child(1).active {
          background: #f56c6c;
        }

        &:nth-child(2).active {
          background: #e6a23c;
        }

        &:nth-child(3).active {
          background: #67c23a;
        }
      }
    }

    .pwd-strength-text {
      font-size: 12px;
      color: #909399;

      &.level-1 {
        color: #f56c6c;
      }

      &.level-2 {
        color: #e6a23c;
      }

      &.level-3 {
        color: #67c23a;
      }
    }
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
</style>
