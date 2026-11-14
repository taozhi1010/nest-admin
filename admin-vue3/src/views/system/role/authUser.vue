<template>
  <div class="auth-user-container">
    <el-form v-show="authUser.showSearch" ref="queryRef" v-no-enter :inline="true" :model="authUser.queryParams">
      <el-form-item label="用户账号" prop="userName">
        <el-input v-model.trim="authUser.queryParams.userName" clearable placeholder="请输入用户账号" style="width: 240px" @keyup.enter="authUser.handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model.trim="authUser.queryParams.phonenumber" clearable placeholder="请输入手机号码" style="width: 240px" @keyup.enter="authUser.handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="authUser.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="authUser.resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:add']" icon="Plus" plain type="primary" @click="openSelectUser">添加用户</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:remove']" :disabled="authUser.multiple" icon="CircleClose" plain type="danger" @click="cancelAuthUserAll">批量取消授权</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button icon="Close" plain type="warning" @click="handleClose">关闭</el-button>
      </el-col>
      <right-toolbar v-model:show-search="authUser.showSearch" @query-table="authUser.getList" />
    </el-row>

    <el-table v-loading="authUser.loading" :data="authUser.list" @selection-change="authUser.handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column label="用户账号" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
      <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
      <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <span>{{ getDictLabel('sys_normal_disable', scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
        <template #default="scope">
          <el-button v-hasPermi="['system:role:remove']" icon="CircleClose" link type="primary" @click="cancelAuthUser(scope.row)">取消授权</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="authUser.total > 0" v-model:limit="authUser.queryParams.pageSize" v-model:page="authUser.queryParams.pageNum" :total="authUser.total" @pagination="authUser.getList" />
    <select-user ref="selectRef" :role-id="authUser.queryParams.roleId" @ok="authUser.handleQuery" />
  </div>
</template>

<script setup name="AuthUser">
// ==================== 导入区域 ====================
import selectUser from './selectUser'
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/system/role'
import { useDict } from '@/composables/useDict'
import { useCrud } from '@/composables/useCrud'
import { parseTime } from '@/composables/useCommon'

// ==================== Props 和 Emits ====================
const props = defineProps({
  roleId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['close'])

// ==================== 实例和字典 ====================
const { sys_normal_disable, getDictLabel } = useDict('sys_normal_disable')

// ==================== 表单引用 ====================
const selectRef = ref(null)
const queryRef = ref(null)

// ==================== 授权用户列表（CRUD 状态机，仅列表） ====================
const authUser = useCrud({
  api: { list: allocatedUserList },
  idKey: 'userId',
  name: '用户',
  // roleId 由外部 watch 注入，不参与查询重置
  query: { userName: undefined, phonenumber: undefined },
  queryRef
})

// ==================== 页面特有操作 ====================

// 返回按钮
const handleClose = () => {
  emit('close')
}

// 打开授权用户表弹窗
const openSelectUser = () => {
  selectRef.value.show()
}

// 取消授权按钮操作
const cancelAuthUser = async (row) => {
  try {
    await ElMessageBox.confirm(`确认要取消该用户"${row.userName}"角色吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await authUserCancel({ userId: row.userId, roleId: +authUser.queryParams.roleId })
    ElMessage.success('取消授权成功')
    authUser.getList()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('取消授权失败:', e)
    }
  }
}

// 批量取消授权按钮操作
const cancelAuthUserAll = async () => {
  const roleId = authUser.queryParams.roleId
  const uIds = authUser.ids.join(',')
  try {
    await ElMessageBox.confirm('是否取消选中用户授权数据项？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await authUserCancelAll({ roleId: +roleId, userIds: uIds })
    ElMessage.success('取消授权成功')
    authUser.getList()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('批量取消授权失败:', e)
    }
  }
}

// ==================== 监听 roleId 变化 ====================
watch(
  () => props.roleId,
  (newVal) => {
    if (newVal) {
      authUser.queryParams.roleId = newVal
      authUser.getList()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.auth-user-container {
  padding: 0 20px;
}
</style>
