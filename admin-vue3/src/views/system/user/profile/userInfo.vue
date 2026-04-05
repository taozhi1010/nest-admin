<template>
  <el-form ref="userInfoRef" label-width="80px" :model="userInfo.form" :rules="userInfo.rules" :validate-on-rule-change="false">
    <el-form-item label="用户昵称" prop="nickName">
      <el-input v-model.trim="userInfo.form.nickName" maxlength="30" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phonenumber">
      <el-input v-model.trim="userInfo.form.phonenumber" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model.trim="userInfo.form.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="userInfo.form.sex">
        <el-radio label="0">男</el-radio>
        <el-radio label="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="userInfo.submit">保存</el-button>
      <el-button type="danger" @click="userInfo.close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
// ==================== 导入区域 ====================
import { updateUserProfile } from '@/api/system/user'

// ==================== Composables ====================
const { closePage } = useTab()

// ==================== Props ====================
const props = defineProps({
  user: {
    type: Object
  }
})

// ==================== 实例和字典 ====================

// ==================== 表单引用 ====================
const userInfoRef = ref(null)

// ==================== 用户信息管理（集中式管理） ====================
const userInfo = reactive({
  // 表单数据
  form: {
    nickName: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined
  },
  // 表单验证规则
  rules: {
    nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
    email: [
      { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ],
    phonenumber: [
      { required: true, message: '手机号码不能为空', trigger: 'blur' },
      { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
  },

  // 提交按钮
  submit: async () => {
    console.log('=== 调用 updateUserProfile 接口 ===')
    console.log('表单数据:', userInfo.form)
    try {
      await proxy.$refs.userInfoRef.validate()
      // 将表单数据与用户原始数据合并
      const updateData = {
        ...props.user,
        ...userInfo.form
      }
      console.log('提交的数据:', updateData)
      await updateUserProfile(updateData)
      ElMessage.success('修改成功')
    } catch (e) {
      if (e !== false) {
        console.error('保存用户信息失败:', e)
      }
    }
  },

  // 关闭按钮
  close: () => {
    closePage()
  }
})

// ==================== 监听 Props 变化 ====================
watch(
  () => props.user,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      // 只在表单未被用户修改过时才填充数据
      if (!userInfo.form.nickName && !userInfo.form.phonenumber && !userInfo.form.email) {
        userInfo.form = {
          nickName: newVal.nickName || '',
          phonenumber: newVal.phonenumber || '',
          email: newVal.email || '',
          sex: newVal.sex || '0'
        }
      }
    }
  },
  { immediate: true }
)
</script>
