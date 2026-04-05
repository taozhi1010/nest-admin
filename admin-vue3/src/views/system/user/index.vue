<template>
  <div class="app-container">
    <div class="main-card">
      <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input v-model.trim="user.deptName" clearable placeholder="请输入部门名称" prefix-icon="Search"
            style="margin-bottom: 20px" />
        </div>
        <div class="head-container">
          <el-tree ref="deptTreeRef" :data="user.deptOptions" default-expand-all :expand-on-click-node="false"
            :filter-node-method="user.filterNode" highlight-current node-key="id"
            :props="{ label: 'label', children: 'children' }" @node-click="user.handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form v-show="user.showSearch" ref="user.queryRef" :inline="true" label-width="68px"
          :model="user.queryParams">
          <el-form-item label="用户账号" prop="userName">
            <el-input v-model.trim="user.queryParams.userName" clearable placeholder="请输入用户账号" style="width: 240px"
              @keyup.enter="user.handleQuery" />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input v-model.trim="user.queryParams.phonenumber" clearable placeholder="请输入手机号码" style="width: 240px"
              @keyup.enter="user.handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="user.queryParams.status" clearable placeholder="用户状态" style="width: 240px">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" style="width: 308px">
            <el-date-picker v-model="user.dateRange" end-placeholder="结束日期" range-separator="-" start-placeholder="开始日期"
              type="daterange" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item>
            <el-button icon="Search" type="primary" @click="user.handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="user.resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row class="mb8" :gutter="10">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:user:add']" icon="Plus" plain type="primary"
              @click="user.handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:user:remove']" :disabled="user.multiple" icon="Delete" plain type="danger"
              @click="user.handleDelete">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:user:import']" icon="Upload" plain type="info"
              @click="user.handleImport">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:user:export']" icon="Download" plain type="warning"
              @click="user.handleExport">导出</el-button>
          </el-col>
          <right-toolbar v-model:show-search="user.showSearch" :columns="user.columns" @query-table="user.getList" />
        </el-row>

        <el-table v-loading="user.loading" :data="user.userList" @selection-change="user.handleSelectionChange">
          <el-table-column align="center" type="selection" width="50" />
          <el-table-column v-if="user.columns[0].visible" key="userId" align="center" label="用户编号" prop="userId" />
          <el-table-column v-if="user.columns[1].visible" key="userName" align="center" label="用户账号" prop="userName"
            :show-overflow-tooltip="true" />
          <el-table-column v-if="user.columns[2].visible" key="nickName" align="center" label="用户昵称" prop="nickName"
            :show-overflow-tooltip="true" />
          <el-table-column v-if="user.columns[3].visible" key="deptName" align="center" label="部门" prop="dept.deptName"
            :show-overflow-tooltip="true" />
          <el-table-column v-if="user.columns[4].visible" key="phonenumber" align="center" label="手机号码"
            prop="phonenumber" width="120" />
          <el-table-column v-if="user.columns[5].visible" key="status" align="center" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" style="cursor: pointer;"
                @click="user.handleStatusClick(scope.row)">
                {{ scope.row.status === '0' ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="user.columns[6].visible" align="center" label="创建时间" prop="createTime" width="160">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="150">
            <template #default="scope">
              <el-tooltip v-if="scope.row.userId !== 1" content="修改" placement="top">
                <el-button v-hasPermi="['system:user:edit']" icon="Edit" link type="primary"
                  @click="user.handleUpdate(scope.row)" />
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="删除" placement="top">
                <el-button v-hasPermi="['system:user:remove']" icon="Delete" link type="danger"
                  @click="user.handleDelete(scope.row)" />
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="重置密码" placement="top">
                <el-button v-hasPermi="['system:user:resetPwd']" icon="Key" link type="primary"
                  @click="user.handleResetPwd(scope.row)" />
              </el-tooltip>
              <el-tooltip v-if="scope.row.userId !== 1" content="分配角色" placement="top">
                <el-button v-hasPermi="['system:user:edit']" icon="CircleCheck" link type="primary"
                  @click="user.handleAuthRole(scope.row)" />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="user.total > 0" v-model:limit="user.queryParams.pageSize"
          v-model:page="user.queryParams.pageNum" :total="user.total" @pagination="user.getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog v-model="user.open" append-to-body :title="user.title" width="600px">
      <el-form ref="userRef" label-width="80px" :model="user.form" :rules="user.rules">
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="user.form.userId == undefined" label="用户账号" prop="userName">
              <el-input v-model.trim="user.form.userName" maxlength="30" placeholder="请输入用户账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="user.form.userId == undefined" label="用户密码" prop="password">
              <el-input v-model.trim="user.form.password" maxlength="20" placeholder="请输入用户密码" show-password
                type="password" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model.trim="user.form.nickName" maxlength="30" placeholder="请输入用户昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <el-tree-select v-model="user.form.deptId" check-strictly :data="user.deptOptions" placeholder="请选择归属部门"
                :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model.trim="user.form.phonenumber" maxlength="11" placeholder="请输入手机号码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model.trim="user.form.email" maxlength="50" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="user.form.sex" placeholder="请选择">
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="user.form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="user.form.postIds" multiple placeholder="请选择">
                <el-option v-for="item in user.postOptions" :key="item.postId" :disabled="item.status == 1"
                  :label="item.postName" :value="item.postId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="user.form.roleIds" multiple placeholder="请选择">
                <el-option v-for="item in user.roleOptions" :key="item.roleId" :disabled="item.status == 1"
                  :label="item.roleName" :value="item.roleId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model.trim="user.form.remark" placeholder="请输入内容" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="user.submitForm">确 定</el-button>
          <el-button @click="user.cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog v-model="user.upload.open" append-to-body :title="user.upload.title" width="400px">
      <el-upload ref="uploadRef" accept=".xlsx, .xls" :auto-upload="false" :disabled="user.upload.isUploading" drag
        :headers="user.upload.headers" :limit="1" :on-change="user.handleFileChange">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="user.upload.updateSupport" />
              是否更新已经存在的用户数据
            </div>
            <span>仅允许导入 xls、xlsx 格式文件。</span>
            <el-link style="font-size: 12px; vertical-align: baseline" type="primary" :underline="false"
              @click="user.downloadTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="user.submitFileForm">确 定</el-button>
          <el-button @click="user.upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配角色抽屉 -->
    <el-drawer v-model="user.authRoleOpen" direction="rtl" size="800px" title="分配角色">
      <el-form label-width="80px" :model="user.authRoleForm">
        <el-form-item label="选择角色">
          <el-select v-model="user.authRoleForm.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option v-for="item in user.roleOptions" :key="item.roleId" :disabled="item.status == 1"
              :label="item.roleName" :value="item.roleId" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 10px">
          <el-button type="primary" @click="user.submitAuthRoleForm">确 定</el-button>
          <el-button @click="user.cancelAuthRole">取 消</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 导入结果对话框 -->
    <el-dialog v-model="user.importResultVisible" append-to-body :title="'导入结果'" width="600px"
      :close-on-click-modal="false">
      <div class="import-result">
        <!-- 统计信息 -->
        <el-descriptions :column="3" size="default" title="统计信息">
          <el-descriptions-item>
            <template #label>
              <el-text type="success">成功</el-text>
            </template>
            <el-text type="success">{{ user.importResult.success }} 条</el-text>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <el-text type="danger">失败</el-text>
            </template>
            <el-text type="danger">{{ user.importResult.error }} 条</el-text>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <el-text>总计</el-text>
            </template>
            <el-text>{{ user.importResult.total }} 条</el-text>
          </el-descriptions-item>
          <el-descriptions-item v-if="user.importResult.hasErrorRows" label="缺失数据行号">
            <el-text>
              <span v-if="!user.importResult.isErrorRange">{{ user.importResult.errorRowsText }}</span>
              <span v-else>{{ user.importResult.errorRangeText }}（共 {{ user.importResult.errorCount }} 行）</span>
            </el-text>
          </el-descriptions-item>
        </el-descriptions>
        <br />

        <!-- 详细错误信息 -->
        <el-descriptions size="default" title="错误详情" />
        <el-table :data="user.importResult.errorDetails" size="small"
          style="width: 100%; max-height: 200px; overflow-y: auto">
          <el-table-column label="行号" prop="row" width="80" align="center">
            <template #default="scope">
              <el-text type="danger" tag="span">第{{ scope.row.row }}行</el-text>
            </template>
          </el-table-column>
          <el-table-column label="错误原因" prop="error" show-overflow-tooltip />
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="user.importResultVisible = false">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script setup name="User">
/**
 * TODO: 用户管理界面
 * 1，用户分配的侧拉抽屉再修改一个更靠谱的模式
 * 2，重置密码之后，应该用弹窗而不是提示，允许用户复制新密码
 * 3，导入功能, 需要后端接口添加创建时间
 * 4，用户再添加新用户的时候，需要做账号检测，已有账号不能再次添加
 */

// ==================== 导入区域 ====================
import { getToken } from '@/utils/auth'
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect, getAuthRole, updateAuthRole, importData } from '@/api/system/user'
import { useDict } from '@/composables/useDict'
import { resetForm, addDateRange, download, parseTime } from '@/composables/useCommon'

// ==================== 实例和字典 ====================
const { sys_normal_disable, sys_user_sex } = useDict('sys_normal_disable', 'sys_user_sex')

// ==================== 表单引用 ====================
const userRef = ref(null)
const deptTreeRef = ref(null)
const uploadRef = ref(null)

// ==================== 用户管理（集中式管理） ====================
const user = reactive({
  // 响应式数据
  queryRef: null,
  userList: [],
  open: false,
  loading: true,
  showSearch: true,
  ids: [],
  single: true,
  multiple: true,
  total: 0,
  title: '',
  dateRange: [],
  deptName: '',
  deptOptions: undefined,
  initPassword: undefined,
  postOptions: [],
  roleOptions: [],

  // 用户导入参数
  upload: {
    // 是否显示弹出层（用户导入）
    open: false,
    // 弹出层标题（用户导入）
    title: '',
    // 是否禁用上传
    isUploading: false,
    // 是否更新已经存在的用户数据
    updateSupport: 0,
    // 设置上传的请求头部
    headers: { Authorization: `Bearer ${getToken()}` },
    // 上传的地址
    url: `${import.meta.env.VITE_APP_BASE_API}system/user/importData`
  },

  // 导入结果显示
  importResultVisible: false,
  importResult: {
    success: 0,
    error: 0,
    total: 0,
    hasErrorRows: false,
    errorRowsText: '',
    isErrorRange: false,
    errorRangeText: '',
    errorCount: 0,
    hasErrorDetails: false,
    errorDetails: [],
    hasSuccessRows: false,
    successRowsText: '',
    hasMoreSuccessRows: false
  },

  // 授权角色抽屉
  authRoleOpen: false,
  authRoleTitle: '',

  // 列显隐信息
  columns: [
    { key: 0, label: `用户编号`, visible: true },
    { key: 1, label: `用户账号`, visible: true },
    { key: 2, label: `用户昵称`, visible: true },
    { key: 3, label: `部门`, visible: true },
    { key: 4, label: `手机号码`, visible: true },
    { key: 5, label: `状态`, visible: true },
    { key: 6, label: `创建时间`, visible: true }
  ],

  // 表单和查询参数
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined
  },
  // 授权角色表单
  authRoleForm: {
    userId: undefined,
    roleIds: []
  },
  rules: {
    userName: [
      { required: true, message: '用户账号不能为空', trigger: 'blur' },
      { min: 2, max: 20, message: '用户账号长度必须介于 2 和 20 之间', trigger: 'blur' }
    ],
    nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
    password: [
      { required: true, message: '用户密码不能为空', trigger: 'blur' },
      { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
    ],
    deptId: [{ required: true, message: '归属部门不能为空', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
  },

  // 方法集合
  // 通过条件过滤节点
  filterNode: (value, data) => {
    if (!value) return true
    return data.label.indexOf(value) !== -1
  },

  // 根据名称筛选部门树
  watchDeptName: () => {
    watch(
      () => user.deptName,
      (val) => {
        deptTreeRef.value.filter(val)
      }
    )
  },

  // 查询部门下拉树结构
  getDeptTree: async () => {
    try {
      const response = await deptTreeSelect()
      user.deptOptions = response.data
    } catch (e) {
      console.error('查询部门树失败:', e)
    }
  },

  // 查询用户列表
  getList: async () => {
    user.loading = true
    try {
      const response = await listUser(addDateRange(user.queryParams, user.dateRange))
      user.userList = response.data.list
      user.total = response.data.total
    } catch (e) {
      console.error('查询用户列表失败:', e)
    } finally {
      user.loading = false
    }
  },

  // 节点单击事件
  handleNodeClick: (data) => {
    user.queryParams.deptId = data.id
    user.handleQuery()
  },

  // 搜索按钮操作
  handleQuery: () => {
    user.queryParams.pageNum = 1
    user.getList()
  },

  // 重置按钮操作
  resetQuery: () => {
    user.dateRange = []
    resetForm(user.queryRef)
    user.queryParams.deptId = undefined
    deptTreeRef.value.setCurrentKey(null)
    user.handleQuery()
  },

  // 删除按钮操作
  handleDelete: async (row) => {
    const userIds = row.userId || user.ids
    try {
      await ElMessageBox.confirm(`是否确认删除用户编号为"${userIds}"的数据项？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await delUser(userIds)
      ElMessage.success('删除成功')
      user.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('删除失败:', e)
      }
    }
  },

  // 导出按钮操作
  handleExport: () => {
    download(
      'system/user/export',
      {
        ...user.queryParams
      },
      `user_${new Date().getTime()}.xlsx`
    )
  },

  // 用户状态修改
  handleStatusChange: async (row) => {
    let text = row.status === '0' ? '启用' : '停用'
    try {
      await ElMessageBox.confirm(`确认要"${text}""${row.userName}"用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await changeUserStatus(row.userId, row.status)
      ElMessage.success(`${text}成功`)
    } catch (e) {
      if (e !== 'cancel') {
        row.status = row.status === '0' ? '1' : '0'
        console.error('状态修改失败:', e)
      }
    }
  },

  // 点击状态标签处理
  handleStatusClick: async (row) => {
    const newStatus = row.status === '0' ? '1' : '0'
    const text = newStatus === '0' ? '启用' : '停用'

    try {
      await ElMessageBox.confirm(`确认要"${text}""${row.userName}"用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 设置列表 loading 状态
      user.loading = true
      // 调用接口更新状态
      await changeUserStatus(row.userId, newStatus)
      // 更新本地数据
      row.status = newStatus
      ElMessage.success(`${text}成功`)
    } catch (e) {
      if (e !== 'cancel') {
        console.error('状态修改失败:', e)
      }
      // 如果用户取消或失败，保持原状态不变
    } finally {
      // 恢复 loading 状态
      user.loading = false
    }
  },

  // 跳转角色分配
  handleAuthRole: async (row) => {
    const userId = row.userId
    try {
      const response = await getAuthRole(userId)
      user.authRoleForm.userId = userId
      user.authRoleForm.roleIds = response.data.roleIds
      user.roleOptions = response.data.roles
      user.authRoleOpen = true
      user.authRoleTitle = `分配角色 - ${row.userName}`
    } catch (e) {
      console.error('获取授权角色失败:', e)
    }
  },

  // 提交授权角色
  submitAuthRoleForm: async () => {
    try {
      await updateAuthRole({
        userId: user.authRoleForm.userId,
        roleIds: user.authRoleForm.roleIds.join(',')
      })
      ElMessage.success('分配成功')
      user.authRoleOpen = false
      user.getList()
    } catch (e) {
      console.error('分配角色失败:', e)
    }
  },

  // 取消授权角色
  cancelAuthRole: () => {
    user.authRoleOpen = false
    user.authRoleForm = {
      userId: undefined,
      roleIds: []
    }
  },

  // 重置密码按钮操作
  handleResetPwd: async (row) => {
    try {
      const { value } = await ElMessageBox.prompt(`请输入"${row.userName}"的新密码`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: '用户密码长度必须介于 5 和 20 之间'
      })
      await resetUserPwd(row.userId, value)
      ElMessage.success(`修改成功，新密码是：${value}`)
    } catch (e) {
      if (e !== 'cancel') {
        console.error('重置密码失败:', e)
      }
    }
  },

  // 选择条数
  handleSelectionChange: (selection) => {
    user.ids = selection.map((item) => item.userId)
    user.single = selection.length != 1
    user.multiple = !selection.length
  },

  // 导入按钮操作
  handleImport: () => {
    user.upload.title = '用户导入'
    user.upload.open = true
  },

  // 下载模板操作
  downloadTemplate: () => {
    download('system/user/downloadTemplate', {}, `user_template_${new Date().getTime()}.xlsx`)
  },

  // 文件选择变化处理
  handleFileChange: (file, fileList) => {
    // 获取文件扩展名
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    // 允许的 Excel 文件扩展名
    const allowedExtensions = ['.xlsx', '.xls']

    // 检查扩展名
    if (!allowedExtensions.includes(fileExtension)) {
      ElMessage.error('仅支持上传 Excel 文件 (.xlsx 或 .xls 格式)')
      // 清空已上传的文件列表
      uploadRef.value?.clearFiles()
      user.upload.file = null
      return
    }

    // 可选：进一步通过 MIME 类型验证
    const validMimeTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/excel']

    if (file.raw && file.raw.type && !validMimeTypes.includes(file.raw.type)) {
      // 注意：某些浏览器可能无法正确识别 MIME 类型，所以这里只做警告不做强制拦截
      console.warn('文件 MIME 类型不推荐:', file.raw.type)
    }

    user.upload.file = file.raw
  },

  // 文件上传中处理
  handleFileUploadProgress: (file, fileList) => {
    user.upload.isUploading = true
  },

  // 文件上传成功处理
  handleFileSuccess: (response) => {
    user.upload.open = false
    user.upload.isUploading = false
    uploadRef.value.clearFiles()

    console.log('导入接口返回数据:', response)

    // 尝试从不同路径获取数据
    const importData = response.data || response.result || response

    // 新接口格式：直接返回统计信息和行号
    if (importData && typeof importData === 'object') {
      // 适配实际的后端返回字段
      const { success, error, total, successRowNums, errorRowNums, details } = importData

      // 设置统计信息
      user.importResult.success = success || 0
      user.importResult.error = error || 0
      user.importResult.total = total || 0

      // 处理错误行号
      if (error > 0 && Array.isArray(errorRowNums) && errorRowNums.length > 0) {
        const uniqueErrorRows = [...new Set(errorRowNums)].sort((a, b) => a - b)
        user.importResult.hasErrorRows = true
        user.importResult.errorCount = uniqueErrorRows.length

        if (uniqueErrorRows.length > 5) {
          const startRow = uniqueErrorRows[0]
          const endRow = uniqueErrorRows[uniqueErrorRows.length - 1]
          user.importResult.isErrorRange = true
          user.importResult.errorRangeText = `${startRow} ~ ${endRow}`
        } else {
          user.importResult.isErrorRange = false
          user.importResult.errorRowsText = uniqueErrorRows.join(', ')
        }

        // 处理详细错误信息
        if (details && details.errorData && details.errorData.length > 0) {
          user.importResult.hasErrorDetails = true
          user.importResult.errorDetails = details.errorData
        } else {
          user.importResult.hasErrorDetails = false
          user.importResult.errorDetails = []
        }
      } else {
        user.importResult.hasErrorRows = false
        user.importResult.hasErrorDetails = false
      }

      // 处理成功行号
      if (success > 0 && Array.isArray(successRowNums) && successRowNums.length > 0) {
        const uniqueSuccessRows = [...new Set(successRowNums)].sort((a, b) => a - b)
        if (uniqueSuccessRows.length <= 10) {
          user.importResult.hasSuccessRows = true
          user.importResult.successRowsText = uniqueSuccessRows.join(', ')
          user.importResult.hasMoreSuccessRows = false
        } else {
          user.importResult.hasSuccessRows = true
          user.importResult.successRowsText = uniqueSuccessRows.slice(0, 10).join(', ')
          user.importResult.hasMoreSuccessRows = true
        }
      } else {
        user.importResult.hasSuccessRows = false
      }

      // 导入成功提示：全部成功或部分成功
      if (success > 0 && error === 0) {
        // 全部成功 - 隐藏错误详情和表单，直接刷新列表
        ElMessage.success(`导入成功，共导入 ${success} 条数据`)
        user.importResultVisible = false
        user.getList()
        return
      } else if (success > 0 && error > 0) {
        // 部分成功 - 显示详细结果
        ElMessage.warning(`导入完成，成功 ${success} 条，失败 ${error} 条`)
      }
    } else if (Array.isArray(importData)) {
      // 兼容旧接口格式：数组形式
      const failedRows = importData.filter((item) => item.fail === true || item.status === 'fail')
      if (failedRows.length > 0) {
        const rowNumbers = failedRows.map((item) => item.rowNum || item.row || item.index).filter((n) => n != null)
        if (rowNumbers.length > 0) {
          const uniqueRows = [...new Set(rowNumbers)].sort((a, b) => a - b)
          user.importResult.hasErrorRows = true
          user.importResult.errorCount = uniqueRows.length

          if (uniqueRows.length > 5) {
            const startRow = uniqueRows[0]
            const endRow = uniqueRows[uniqueRows.length - 1]
            user.importResult.isErrorRange = true
            user.importResult.errorRangeText = `${startRow} ~ ${endRow}`
          } else {
            user.importResult.isErrorRange = false
            user.importResult.errorRowsText = uniqueRows.join(', ')
          }
        }
      }
    }

    // 显示导入结果对话框
    user.importResultVisible = true
    user.getList()
  },

  // 提交上传文件
  submitFileForm: async () => {
    if (!user.upload.file) {
      ElMessage.warning('请选择文件')
      return
    }

    const formData = new FormData()
    formData.append('file', user.upload.file)

    try {
      user.upload.isUploading = true
      // 使用 URL 查询参数形式传递 updateSupport 参数
      const response = await importData(formData, {
        params: {
          updateSupport: user.upload.updateSupport ? 1 : 0
        }
      })
      user.handleFileSuccess(response)
    } catch (e) {
      user.upload.isUploading = false
      if (e !== 'cancel') {
        console.error('导入失败:', e)
        // 即使报错也显示错误信息
        ElMessageBox.alert(`<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>${e.message || '导入失败，请重试'}</div>`, '导入结果', { dangerouslyUseHTMLString: true })
      }
    }
  },

  // 重置操作表单
  reset: () => {
    user.form = {
      userId: undefined,
      deptId: undefined,
      userName: undefined,
      nickName: undefined,
      password: undefined,
      phonenumber: undefined,
      email: undefined,
      sex: undefined,
      status: '0',
      remark: undefined,
      postIds: [],
      roleIds: []
    }
    resetForm(userRef)
  },

  // 取消按钮
  cancel: () => {
    user.open = false
    user.reset()
  },

  // 新增按钮操作
  handleAdd: async () => {
    user.reset()
    try {
      const response = await getUser()
      user.postOptions = response.data.posts
      user.roleOptions = response.data.roles
      user.open = true
      user.title = '添加用户'
      user.form.password = user.initPassword
    } catch (e) {
      console.error('获取用户信息失败:', e)
    }
  },

  // 修改按钮操作
  handleUpdate: async (row) => {
    const userId = row.userId || user.ids
    try {
      // 获取用户详情（包含 posts 和 roles）
      const userResponse = await getUser(userId)

      console.log('用户详情完整响应:', userResponse)
      console.log('response.data:', userResponse.data)

      // 适配后端返回的数据结构（多包了一层 data）
      const res = userResponse.data?.data
      console.log('解析后的响应数据:', res)

      // 从 res 中提取用户信息、岗位列表、角色列表
      const userData = res.data || res // 用户信息可能在 data 字段或直接在根节点
      const postsData = userResponse.data.posts || [] // 岗位列表
      const rolesData = userResponse.data.roles || [] // 角色列表
      const roleIds = userResponse.data.roleIds || [] // 已选角色 ID
      const postIds = userResponse.data.postIds || [] // 已选岗位 ID

      console.log('用户数据:', userData)
      console.log('岗位列表（下拉选项）:', postsData)
      console.log('角色列表（下拉选项）:', rolesData)
      console.log('已选岗位 IDs:', postIds)
      console.log('已选角色 IDs:', roleIds)

      // 使用 JSON 序列化进行深拷贝，避免引用问题
      user.form = {
        userId: userData.userId,
        deptId: userData.deptId,
        userName: userData.userName,
        nickName: userData.nickName,
        password: '',
        phonenumber: userData.phonenumber,
        email: userData.email,
        sex: userData.sex,
        status: userData.status,
        remark: userData.remark,
        postIds: postIds.length > 0 ? JSON.parse(JSON.stringify(postIds)) : [],
        roleIds: roleIds.length > 0 ? JSON.parse(JSON.stringify(roleIds)) : []
      }
      console.log('赋值后的表单数据:', user.form)

      console.log('部门选项数据:', user.deptOptions)

      // 使用 Object.assign 确保响应式更新
      Object.assign(user, {
        postOptions: postsData.length > 0 ? postsData : [],
        roleOptions: rolesData.length > 0 ? rolesData : []
      })

      console.log('最终岗位选项:', user.postOptions, '长度:', user.postOptions.length)
      console.log('最终角色选项:', user.roleOptions, '长度:', user.roleOptions.length)
      console.log('最终部门选项:', user.deptOptions)

      user.open = true
      user.title = '修改用户'
      // 等待 DOM 更新后清除验证信息
      nextTick(() => {
        userRef.value?.clearValidate()
      })
    } catch (e) {
      console.error('获取用户信息失败:', e)
    }
  },

  // 提交按钮
  submitForm: () => {
    userRef.value.validate(async (valid) => {
      if (!valid) return

      try {
        if (user.form.userId != undefined) {
          await updateUser(user.form)
          ElMessage.success('修改成功')
        } else {
          await addUser(user.form)
          ElMessage.success('新增成功')
        }
        user.open = false
        user.getList()
      } catch (e) {
        console.error('提交失败:', e)
      }
    })
  }
})

// 初始化 watch
user.watchDeptName()

// ==================== 初始化加载 ====================
user.getDeptTree()
user.getList()
</script>

<style lang="scss" scoped>
.import-result {
  .result-summary {
    padding-bottom: 15px;
    border-bottom: 2px solid #eee;
    margin-bottom: 15px;
  }

  .result-section {
    padding: 12px 0;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
