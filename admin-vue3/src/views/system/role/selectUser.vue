<template>
  <!-- 授权用户 -->
  <el-dialog title="选择用户" v-model="selectUser.visible" width="800px" top="5vh" append-to-body>
    <el-form :model="selectUser.queryParams" ref="selectUser.queryRef" :inline="true">
      <el-form-item label="用户账号" prop="userName">
        <el-input v-model.trim="selectUser.queryParams.userName" placeholder="请输入用户账号" clearable style="width: 200px"
          @keyup.enter="selectUser.handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model.trim="selectUser.queryParams.phonenumber" placeholder="请输入手机号码" clearable style="width: 200px"
          @keyup.enter="selectUser.handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="selectUser.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="selectUser.resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="selectUser.clickRow" ref="refTable" :data="selectUser.userList"
        @selection-change="selectUser.handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
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
      </el-table>
      <pagination v-show="selectUser.total > 0" :total="selectUser.total" v-model:page="selectUser.queryParams.pageNum"
        v-model:limit="selectUser.queryParams.pageSize" @pagination="selectUser.getList" />
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="selectUser.handleSelectUser">确 定</el-button>
        <el-button @click="selectUser.visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="SelectUser">
// ==================== 导入区域 ====================
import { authUserSelectAll, unallocatedUserList } from '@/api/system/role'
import { useDict } from '@/composables/useDict'
import { resetForm, parseTime } from '@/composables/useCommon'

// ==================== Props 和 Emits ====================
const props = defineProps({
  roleId: {
    type: [Number, String]
  }
})

const emit = defineEmits(['ok'])

// ==================== 实例和字典 ====================
const { proxy } = getCurrentInstance()
const { sys_normal_disable } = useDict('sys_normal_disable')

// ==================== 表单引用 ====================
const refTable = ref(null)

// ==================== 选择用户管理（集中式管理） ====================
const selectUser = reactive({
  // 响应式数据
  queryRef: null,
  userList: [],
  visible: false,
  total: 0,
  userIds: [],

  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    roleId: undefined,
    userName: undefined,
    phonenumber: undefined
  },

  // 方法集合
  // 显示弹框
  show: () => {
    selectUser.queryParams.roleId = props.roleId
    selectUser.getList()
    selectUser.visible = true
  },

  // 选择行
  clickRow: (row) => {
    proxy.$refs['refTable'].toggleRowSelection(row)
  },

  // 多选框选中数据
  handleSelectionChange: (selection) => {
    selectUser.userIds = selection.map((item) => item.userId)
  },

  // 查询表数据
  getList: async () => {
    try {
      const response = await unallocatedUserList(selectUser.queryParams)
      selectUser.userList = response.data.list
      selectUser.total = response.data.total
    } catch (e) {
      console.error('查询用户列表失败:', e)
    }
  },

  // 搜索按钮操作
  handleQuery: () => {
    selectUser.queryParams.pageNum = 1
    selectUser.getList()
  },

  // 重置按钮操作
  resetQuery: () => {
    resetForm(selectUser.queryRef)
    selectUser.handleQuery()
  },

  // 选择授权用户操作
  handleSelectUser: async () => {
    const roleId = selectUser.queryParams.roleId
    const uIds = selectUser.userIds.join(',')

    if (uIds == '') {
      proxy.$modal.msgError('请选择要分配的用户')
      return
    }

    try {
      const response = await authUserSelectAll({ roleId: +roleId, userIds: uIds })
      proxy.$modal.msgSuccess(response.msg)
      if (response.code === 200) {
        selectUser.visible = false
        emit('ok')
      }
    } catch (e) {
      console.error('分配用户失败:', e)
    }
  }
})

// ==================== 暴露方法 ====================
defineExpose({
  show
})
</script>
