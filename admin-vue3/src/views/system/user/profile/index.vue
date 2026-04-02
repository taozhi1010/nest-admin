<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card" :body-style="{ height: 'calc(100vh - 200px)', overflow: 'auto' }">
          <template #header>
            <div class="clearfix">
              <span>个人信息</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <user-avatar :user="profile.user" @update-avatar="profile.updateAvatar" />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />
                用户账号
                <div class="pull-right">{{ profile.user.userName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />
                手机号码
                <div class="pull-right">{{ profile.user.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />
                用户邮箱
                <div class="pull-right">{{ profile.user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />
                所属部门
                <div v-if="profile.user.dept" class="pull-right">{{ profile.user.dept.deptName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />
                所属角色
                <div v-if="profile.user.roles && Array.isArray(profile.user.roles)" class="pull-right">
                  <el-tag v-for="(role, index) in profile.user.roles" :key="index" size="small" style="margin-left: 5px;">
                    {{ role.roleName }}
                  </el-tag>
                </div>
                <div v-else class="pull-right">{{ profile.user.roles || '-' }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />
                创建日期
                <div v-if="profile.user.createTime" class="pull-right">{{ dayjs(profile.user.createTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card :body-style="{ height: 'calc(100vh - 200px)', overflow: 'auto' }">
          <template #header>
            <div class="clearfix">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="profile.activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <user-info :user="profile.user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <reset-pwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Profile">
// ==================== 导入区域 ====================
import userAvatar from './userAvatar'
import userInfo from './userInfo'
import resetPwd from './resetPwd'
import { getUserProfile } from '@/api/system/user'
import dayjs from 'dayjs'

// ==================== 实例和字典 ====================
const { proxy } = getCurrentInstance()

// ==================== 方法定义 ====================

// 拼接完整的图片 URL（处理双斜杠问题）
const buildImageUrl = (path) => {
  if (!path) return ''
  
  // 如果已经是完整 URL（以 http 或 https 开头），直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  const baseUrl = import.meta.env.VITE_APP_BASE_API.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  let url = `${baseUrl}${normalizedPath}`
  
  // 从第 3 个字符开始替换所有的双斜杠（保留 http:// 或 https://）
  if (url.startsWith('http')) {
    const protocol = url.substring(0, url.indexOf('://') + 3)
    const rest = url.substring(url.indexOf('://') + 3).replaceAll('//', '/')
    url = protocol + rest
  } else {
    url = url.replaceAll('//', '/')
  }
  
  return url
}

// ==================== 个人信息管理（集中式管理） ====================
const profile = reactive({
  // 响应式数据
  activeTab: 'userinfo',
  user: {},
  roleGroup: {},
  postGroup: {},

  // 方法集合
  // 获取用户信息
  getUser: async () => {
    try {
      const response = await getUserProfile()
      
      profile.user = response.data
      profile.user.createTime = dayjs(profile.user.createTime).format('YYYY-MM-DD HH:mm:ss')
      
      // 处理头像路径（使用统一的 URL 构建方法）
      if (profile.user.avatar) {
        profile.user.avatar = buildImageUrl(profile.user.avatar)
      }
      
      const roles = response.data.roles
        .filter((x) => x && typeof x === 'object' && Object.prototype.hasOwnProperty.call(x, 'roleName'))
        .map((x) => x.roleName)
        .join('、')
      profile.user.roles = roles
      profile.roleGroup = response.roleGroup
      profile.postGroup = response.postGroup
    } catch (e) {
      console.error('获取用户信息失败:', e)
    }
  },

  // 更新头像
  updateAvatar: async (url) => {
    const fullUrl = buildImageUrl(url)
    profile.user.avatar = fullUrl
    
    // 重新获取用户信息以确保数据完全同步
    await profile.getUser()
  }
})

// ==================== 初始化加载 ====================
profile.getUser()
</script>
