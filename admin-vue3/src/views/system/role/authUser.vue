<template>
  <div class="app-container">
    <el-form :model="authUser.queryParams" ref="authUser.queryRef" v-show="authUser.showSearch" :inline="true">
      <el-form-item label="用户账号" prop="userName">
        <el-input v-model.trim="authUser.queryParams.userName" placeholder="请输入用户账号" clearable style="width: 240px"
          @keyup.enter="authUser.handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model.trim="authUser.queryParams.phonenumber" placeholder="请输入手机号码" clearable style="width: 240px"
          @keyup.enter="authUser.handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="authUser.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="authUser.resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="authUser.openSelectUser"
          v-hasPermi="['system:role:add']">添加用户</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="CircleClose" :disabled="authUser.multiple"
          @click="authUser.cancelAuthUserAll" v-hasPermi="['system:role:remove']">批量取消授权</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Close" @click="authUser.handleClose">关闭</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="authUser.showSearch" @queryTable="authUser.getList"></right-toolbar>
    </el-row>

    <el-table v-loading="authUser.loading" :data="authUser.userList" @selection-change="authUser.handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户账号" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
      <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
      <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="CircleClose" @click="authUser.cancelAuthUser(scope.row)"
            v-hasPermi="['system:role:remove']">取消授权</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="authUser.total > 0" :total="authUser.total" v-model:page="authUser.queryParams.pageNum"
      v-model:limit="authUser.queryParams.pageSize" @pagination="authUser.getList" />
    <select-user ref="selectRef" :roleId="authUser.queryParams.roleId" @ok="authUser.handleQuery" />
  </div>
</template>

<script setup name="AuthUser">
// ==================== 导入区域 ====================
import selectUser from './selectUser'
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/system/role'
import { useDict } from '@/composables/useDict'
import { resetForm, parseTime } from '@/composables/useCommon'

// ==================== 实例和字典 ====================
const route = useRoute()
const { proxy } = getCurrentInstance()
const { sys_normal_disable } = useDict('sys_normal_disable')

// ==================== 表单引用 ====================
const selectRef = ref(null)

// ==================== 授权用户管理（集中式管理） ====================
const authUser = reactive({
  // 响应式数据
  queryRef: null,
  userList: [],
  loading: true,
  showSearch: true,
  multiple: true,
  total: 0,
  userIds: [],

  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    roleId: route.params.roleId,
    userName: undefined,
    phonenumber: undefined
  },

  // 方法集合
  // 查询授权用户列表
  getList: async () => {
    authUser.loading = true
    try {
      const response = await allocatedUserList(authUser.queryParams)
      authUser.userList = response.data.list
      authUser.total = response.data.total
    } finally {
      authUser.loading = false
    }
  },

  // 返回按钮
  handleClose: () => {
    const obj = { path: '/system/role' }
    proxy.$tab.closeOpenPage(obj)
  },

  // 搜索按钮操作
  handleQuery: () => {
    authUser.queryParams.pageNum = 1
    authUser.getList()
  },

  // 重置按钮操作
  resetQuery: () => {
    resetForm(authUser.queryRef)
    authUser.handleQuery()
  },

  // 多选框选中数据
  handleSelectionChange: (selection) => {
    authUser.userIds = selection.map((item) => item.userId)
    authUser.multiple = !selection.length
  },

  // 打开授权用户表弹窗
  openSelectUser: () => {
    proxy.$refs['selectRef'].show()
  },

  // 取消授权按钮操作
  cancelAuthUser: async (row) => {
    try {
      await proxy.$modal.confirm('确认要取消该用户"' + row.userName + '"角色吗？')
      await authUserCancel({ userId: row.userId, roleId: +authUser.queryParams.roleId })
      proxy.$modal.msgSuccess('取消授权成功')
      authUser.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('取消授权失败:', e)
      }
    }
  },

  // 批量取消授权按钮操作
  cancelAuthUserAll: async () => {
    const roleId = authUser.queryParams.roleId
    const uIds = authUser.userIds.join(',')
    try {
      await proxy.$modal.confirm('是否取消选中用户授权数据项？')
      await authUserCancelAll({ roleId: +roleId, userIds: uIds })
      proxy.$modal.msgSuccess('取消授权成功')
      authUser.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('批量取消授权失败:', e)
      }
    }
  }
})

// ==================== 初始化加载 ====================
authUser.getList()
</script>
