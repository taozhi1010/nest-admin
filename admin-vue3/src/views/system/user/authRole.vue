<template>
  <div class="app-container">
    <h4 class="form-header h4">基本信息</h4>
    <el-form label-width="80px" :model="authRole.form">
      <el-row>
        <el-col :offset="2" :span="8">
          <el-form-item label="用户昵称" prop="nickName">
            <el-input v-model="authRole.form.nickName" disabled />
          </el-form-item>
        </el-col>
        <el-col :offset="2" :span="8">
          <el-form-item label="登录账号" prop="userName">
            <el-input v-model="authRole.form.userName" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <h4 class="form-header h4">角色信息</h4>
    <el-table ref="roleRef" v-loading="authRole.loading" :data="authRole.roles.slice((authRole.pageNum - 1) * authRole.pageSize, authRole.pageNum * authRole.pageSize)" :row-key="authRole.getRowKey" @row-click="authRole.clickRow" @selection-change="authRole.handleSelectionChange">
      <el-table-column align="center" label="序号" type="index" width="55">
        <template #default="scope">
          <span>{{ (authRole.pageNum - 1) * authRole.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column :reserve-selection="true" type="selection" width="55" />
      <el-table-column align="center" label="角色编号" prop="roleId" />
      <el-table-column align="center" label="角色名称" prop="roleName" />
      <el-table-column align="center" label="权限字符" prop="roleKey" />
      <el-table-column align="center" label="创建时间" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="authRole.total > 0" v-model:limit="authRole.pageSize" v-model:page="authRole.pageNum" :total="authRole.total" />

    <el-form label-width="100px">
      <div style="text-align: center; margin-left: -120px; margin-top: 30px">
        <el-button type="primary" @click="authRole.submitForm()">提交</el-button>
        <el-button @click="authRole.close()">返回</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup name="AuthRole">
// ==================== 导入区域 ====================
import { getAuthRole, updateAuthRole } from '@/api/system/user'
import { parseTime } from '@/composables/useCommon'

// ==================== 实例和字典 ====================
const route = useRoute()

// ==================== 表单引用 ====================
const roleRef = ref(null)

// ==================== 授权角色管理（集中式管理） ====================
const authRole = reactive({
  // 响应式数据
  loading: true,
  total: 0,
  pageNum: 1,
  pageSize: 10,
  roleIds: [],
  roles: [],

  // 表单数据
  form: {
    nickName: undefined,
    userName: undefined,
    userId: undefined
  },

  // 方法集合
  // 单击选中行数据
  clickRow: (row) => {
    proxy.$refs['roleRef'].toggleRowSelection(row)
  },

  // 多选框选中数据
  handleSelectionChange: (selection) => {
    authRole.roleIds = selection.map((item) => item.roleId)
  },

  // 保存选中的数据编号
  getRowKey: (row) => {
    return row.roleId
  },

  // 关闭按钮
  close: () => {
    const { closeOpenPage } = useTab()
    const obj = { path: '/system/user' }
    closeOpenPage(obj)
  },

  // 提交按钮
  submitForm: async () => {
    try {
      const userId = authRole.form.userId
      const rIds = authRole.roleIds.join(',')
      await updateAuthRole({ userId: userId, roleIds: rIds })
      ElMessage.success('授权成功')
      authRole.close()
    } catch (e) {
      console.error('授权失败:', e)
    }
  },

  // 初始化加载
  init: async () => {
    const userId = route.params && route.params.userId
    if (userId) {
      try {
        authRole.loading = true
        const response = await getAuthRole(userId)
        authRole.form = response.data.user
        authRole.roles = response.data.roles
        authRole.total = authRole.roles.length
        nextTick(() => {
          authRole.roles.forEach((row) => {
            if (row.flag) {
              proxy.$refs['roleRef'].toggleRowSelection(row)
            }
          })
        })
      } catch (e) {
        console.error('获取角色信息失败:', e)
      } finally {
        authRole.loading = false
      }
    }
  }
})

// ==================== 初始化加载 ====================
authRole.init()
</script>
