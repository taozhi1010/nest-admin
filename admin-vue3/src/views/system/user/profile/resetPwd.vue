<template>
  <el-form ref="pwdRef" label-width="80px" :model="resetPwd.form" :rules="resetPwd.rules">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model.trim="resetPwd.form.oldPassword" placeholder="请输入旧密码" show-password type="password" />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model.trim="resetPwd.form.newPassword" placeholder="请输入新密码" show-password type="password" />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model.trim="resetPwd.form.confirmPassword" placeholder="请确认新密码" show-password type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="resetPwd.submit">保存</el-button>
      <el-button type="danger" @click="resetPwd.close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
// ==================== 导入区域 ====================
import { updateUserPwd } from '@/api/system/user'

// ==================== Composables ====================
const { closePage } = useTab()

// ==================== 实例和字典 ====================

// ==================== 表单引用 ====================
const pwdRef = ref(null)

// ==================== 自定义验证器 ====================
const equalToPassword = (rule, value, callback) => {
  if (resetPwd.form.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// ==================== 重置密码管理（集中式管理） ====================
const resetPwd = reactive({
  // 表单数据
  form: {
    oldPassword: undefined,
    newPassword: undefined,
    confirmPassword: undefined
  },

  // 表单验证规则
  rules: {
    oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '新密码不能为空', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '确认密码不能为空', trigger: 'blur' },
      { required: true, validator: equalToPassword, trigger: 'blur' }
    ]
  },

  // 方法集合
  // 提交按钮
  submit: async () => {
    try {
      await proxy.$refs.pwdRef.validate()
      await updateUserPwd(resetPwd.form.oldPassword, resetPwd.form.newPassword)
      ElMessage.success('修改成功')
    } catch (e) {
      if (e !== false) {
        console.error('修改密码失败:', e)
      }
    }
  },

  // 关闭按钮
  close: () => {
    closePage()
  }
})
</script>
