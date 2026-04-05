<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="role.showSearch" ref="role.queryRef" :inline="true" label-width="68px" :model="role.queryParams">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model.trim="role.queryParams.roleName" clearable placeholder="请输入角色名称" style="width: 240px" @keyup.enter="role.handleQuery" />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input v-model.trim="role.queryParams.roleKey" clearable placeholder="请输入权限字符" style="width: 240px" @keyup.enter="role.handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="role.queryParams.status" clearable placeholder="角色状态" style="width: 240px">
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker v-model="role.dateRange" end-placeholder="结束日期" range-separator="-" start-placeholder="开始日期" type="daterange" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="role.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="role.resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:add']" icon="Plus" plain type="primary" @click="role.handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:remove']" :disabled="role.multiple" icon="Delete" plain type="danger" @click="role.handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:export']" icon="Download" plain type="warning" @click="role.handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:show-search="role.showSearch" @query-table="role.getList" />
    </el-row>

    <!-- 表格数据 -->
    <el-table v-loading="role.loading" :data="role.roleList" @selection-change="role.handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column label="角色编号" prop="roleId" width="120" />
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="显示顺序" prop="roleSort" width="100" />
      <el-table-column align="center" label="状态" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="role.handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
        <template #default="scope">
          <el-tooltip v-if="scope.row.roleId !== 1" content="修改" placement="top">
            <el-button v-hasPermi="['system:role:edit']" icon="Edit" link type="primary" @click="role.handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip v-if="scope.row.roleId !== 1" content="删除" placement="top">
            <el-button v-hasPermi="['system:role:remove']" icon="Delete" link type="primary" @click="role.handleDelete(scope.row)" />
          </el-tooltip>
          <el-tooltip v-if="scope.row.roleId !== 1" content="数据权限" placement="top">
            <el-button v-hasPermi="['system:role:edit']" icon="CircleCheck" link type="primary" @click="role.handleDataScope(scope.row)" />
          </el-tooltip>
          <el-tooltip v-if="scope.row.roleId !== 1" content="分配用户" placement="top">
            <el-button v-hasPermi="['system:role:edit']" icon="User" link type="primary" @click="role.handleAuthUser(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="role.total > 0" v-model:limit="role.queryParams.pageSize" v-model:page="role.queryParams.pageNum" :total="role.total" @pagination="role.getList" />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog v-model="role.open" append-to-body :title="role.title" width="500px">
      <el-form ref="roleRef" label-width="100px" :model="role.form" :rules="role.rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model.trim="role.form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template #label>
            <span>
              <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              权限字符
            </span>
          </template>
          <el-input v-model.trim="role.form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number v-model.trim="role.form.roleSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="role.form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="role.menuExpand" @change="role.handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="role.menuNodeAll" @change="role.handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="role.form.menuCheckStrictly" @change="role.handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree ref="menuRef" :check-strictly="!role.form.menuCheckStrictly" class="tree-border" :data="role.menuOptions" empty-text="加载中，请稍候" node-key="id" :props="{ label: 'label', children: 'children' }" show-checkbox />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="role.form.remark" placeholder="请输入内容" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="role.submitForm">确 定</el-button>
          <el-button @click="role.cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配角色数据权限对话框 -->
    <el-dialog v-model="role.openDataScope" append-to-body :title="role.title" width="500px">
      <el-form label-width="80px" :model="role.form">
        <el-form-item label="角色名称">
          <el-input v-model="role.form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="role.form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="role.form.dataScope" @change="role.dataScopeSelectChange">
            <el-option v-for="item in role.dataScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="role.form.dataScope == 2" label="数据权限">
          <el-checkbox v-model="role.deptExpand" @change="role.handleCheckedTreeExpand($event, 'dept')">展开/折叠</el-checkbox>
          <el-checkbox v-model="role.deptNodeAll" @change="role.handleCheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
          <el-checkbox v-model="role.form.deptCheckStrictly" @change="role.handleCheckedTreeConnect($event, 'dept')">父子联动</el-checkbox>
          <el-tree ref="deptRef" :check-strictly="!role.form.deptCheckStrictly" class="tree-border" :data="role.deptOptions" default-expand-all empty-text="加载中，请稍候" node-key="id" :props="{ label: 'label', children: 'children' }" show-checkbox />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="role.submitDataScope">确 定</el-button>
          <el-button @click="role.cancelDataScope">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script setup name="Role">
// ==================== 导入区域 ====================
import { addRole, changeRoleStatus, dataScope, delRole, getRole, listRole, updateRole, deptTreeSelect } from '@/api/system/role'
import { roleMenuTreeselect, treeselect as menuTreeselect } from '@/api/system/menu'
import { useDict } from '@/composables/useDict'
import { resetForm, addDateRange, download, parseTime } from '@/composables/useCommon'

// ==================== 实例和字典 ====================
const { sys_normal_disable } = useDict('sys_normal_disable')

// ==================== 表单引用 ====================
const roleRef = ref(null)
const menuRef = ref(null)
const deptRef = ref(null)

// ==================== 角色管理（集中式管理） ====================
const role = reactive({
  // 响应式数据
  queryRef: null,
  roleList: [],
  open: false,
  loading: true,
  showSearch: true,
  ids: [],
  single: true,
  multiple: true,
  total: 0,
  title: '',
  dateRange: [],
  menuOptions: [],
  menuExpand: false,
  menuNodeAll: false,
  deptExpand: true,
  deptNodeAll: false,
  deptOptions: [],
  openDataScope: false,

  // 数据范围选项
  dataScopeOptions: [
    { value: '1', label: '全部数据权限' },
    { value: '2', label: '自定数据权限' },
    { value: '3', label: '本部门数据权限' },
    { value: '4', label: '本部门及以下数据权限' },
    { value: '5', label: '仅本人数据权限' }
  ],

  // 表单和查询参数
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    roleName: undefined,
    roleKey: undefined,
    status: undefined
  },
  rules: {
    roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
    roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
    roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
  },

  // 方法集合
  // 查询角色列表
  getList: async () => {
    role.loading = true
    try {
      const response = await listRole(addDateRange(role.queryParams, role.dateRange))
      role.roleList = response.data.list
      role.total = response.data.total
    } finally {
      role.loading = false
    }
  },

  // 取消按钮
  cancel: () => {
    role.open = false
    role.reset()
  },

  // 取消按钮（数据权限）
  cancelDataScope: () => {
    role.openDataScope = false
    role.reset()
  },

  // 表单重置
  reset: () => {
    if (menuRef.value != undefined) {
      menuRef.value.setCheckedKeys([])
    }
    role.menuExpand = false
    role.menuNodeAll = false
    role.deptExpand = true
    role.deptNodeAll = false
    role.form = {
      roleId: undefined,
      roleName: undefined,
      roleKey: undefined,
      roleSort: 0,
      status: '0',
      menuIds: [],
      deptIds: [],
      menuCheckStrictly: true,
      deptCheckStrictly: true,
      remark: undefined
    }
    resetForm(roleRef.value)
  },

  // 搜索按钮操作
  handleQuery: () => {
    role.queryParams.pageNum = 1
    role.getList()
  },

  // 重置按钮操作
  resetQuery: () => {
    role.dateRange = []
    resetForm(role.queryRef)
    role.handleQuery()
  },

  // 多选框选中数据
  handleSelectionChange: (selection) => {
    role.ids = selection.map((item) => item.roleId)
    role.single = selection.length != 1
    role.multiple = !selection.length
  },

  // 新增按钮操作
  handleAdd: () => {
    role.reset()
    role.getMenuTreeselect()
    role.open = true
    role.title = '添加角色'
  },

  // 修改按钮操作
  handleUpdate: async (row) => {
    role.reset()
    const roleId = row.roleId || role.ids
    try {
      const response = await getRole(roleId)
      role.form = response.data
      role.form.roleSort = Number(role.form.roleSort)
      role.open = true
      role.title = '修改角色'

      // 获取角色菜单权限
      const roleMenuResponse = await role.getRoleMenuTreeselect(roleId)
      nextTick(() => {
        let checkedKeys = roleMenuResponse.data.checkedKeys
        checkedKeys.forEach((v) => {
          nextTick(() => {
            menuRef.value.setChecked(v, true, false)
          })
        })
      })
    } catch (e) {
      console.error('获取角色信息失败:', e)
    }
  },

  // 删除按钮操作
  handleDelete: async (row) => {
    const roleIds = row.roleId || role.ids
    try {
      await ElMessageBox.confirm(`是否确认删除角色编号为"${roleIds}"的数据项？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await delRole(roleIds)
      ElMessage.success('删除成功')
      role.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('删除失败:', e)
      }
    }
  },

  // 导出按钮操作
  handleExport: () => {
    download(
      'system/role/export',
      {
        ...role.queryParams
      },
      `role_${new Date().getTime()}.xlsx`
    )
  },

  // 角色状态修改
  handleStatusChange: async (row) => {
    let text = row.status === '0' ? '启用' : '停用'
    try {
      await ElMessageBox.confirm(`确认要"${text}""${row.roleName}"角色吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await changeRoleStatus(row.roleId, row.status)
      ElMessage.success(`${text}成功`)
    } catch (e) {
      if (e !== 'cancel') {
        row.status = row.status === '0' ? '1' : '0'
        console.error('状态修改失败:', e)
      }
    }
  },

  // 分配用户
  handleAuthUser: (row) => {
    router.push(`/system/role-auth/user/${row.roleId}`)
  },

  // 查询菜单树结构
  getMenuTreeselect: async () => {
    try {
      const response = await menuTreeselect()
      role.menuOptions = response.data
    } catch (e) {
      console.error('获取菜单树失败:', e)
    }
  },

  // 根据角色 ID 查询菜单树结构
  getRoleMenuTreeselect: async (roleId) => {
    try {
      const response = await roleMenuTreeselect(roleId)
      role.menuOptions = response.data.menus
      return response
    } catch (e) {
      console.error('获取角色菜单失败:', e)
      throw e
    }
  },

  // 根据角色 ID 查询部门树结构
  getDeptTree: async (roleId) => {
    try {
      const response = await deptTreeSelect(roleId)
      role.deptOptions = response.data.depts
      return response
    } catch (e) {
      console.error('获取部门树失败:', e)
      throw e
    }
  },

  // 树权限（展开/折叠）
  handleCheckedTreeExpand: (value, type) => {
    if (type == 'menu') {
      let treeList = role.menuOptions
      for (let i = 0; i < treeList.length; i++) {
        menuRef.value.store.nodesMap[treeList[i].id].expanded = value
      }
    } else if (type == 'dept') {
      let treeList = role.deptOptions
      for (let i = 0; i < treeList.length; i++) {
        deptRef.value.store.nodesMap[treeList[i].id].expanded = value
      }
    }
  },

  // 树权限（全选/全不选）
  handleCheckedTreeNodeAll: (value, type) => {
    if (type == 'menu') {
      menuRef.value.setCheckedNodes(value ? role.menuOptions : [])
    } else if (type == 'dept') {
      deptRef.value.setCheckedNodes(value ? role.deptOptions : [])
    }
  },

  // 树权限（父子联动）
  handleCheckedTreeConnect: (value, type) => {
    if (type == 'menu') {
      role.form.menuCheckStrictly = value ? true : false
    } else if (type == 'dept') {
      role.form.deptCheckStrictly = value ? true : false
    }
  },

  // 所有菜单节点数据
  getMenuAllCheckedKeys: () => {
    // 目前被选中的菜单节点
    let checkedKeys = menuRef.value.getCheckedKeys()
    // 半选中的菜单节点
    let halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
    checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
    return checkedKeys
  },

  // 所有部门节点数据
  getDeptAllCheckedKeys: () => {
    // 目前被选中的部门节点
    let checkedKeys = deptRef.value.getCheckedKeys()
    // 半选中的部门节点
    let halfCheckedKeys = deptRef.value.getHalfCheckedKeys()
    checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
    return checkedKeys
  },

  // 提交按钮
  submitForm: () => {
    roleRef.value.validate(async (valid) => {
      if (!valid) return

      try {
        if (role.form.roleId != undefined) {
          role.form.menuIds = role.getMenuAllCheckedKeys()
          await updateRole(role.form)
          ElMessage.success('修改成功')
        } else {
          role.form.menuIds = role.getMenuAllCheckedKeys()
          await addRole(role.form)
          ElMessage.success('新增成功')
        }
        role.open = false
        role.getList()
      } catch (e) {
        console.error('提交失败:', e)
      }
    })
  },

  // 选择角色权限范围触发
  dataScopeSelectChange: (value) => {
    if (value !== '2') {
      deptRef.value.setCheckedKeys([])
    }
  },

  // 分配数据权限操作
  handleDataScope: async (row) => {
    role.reset()
    const roleId = row.roleId
    try {
      const deptTreeResponse = await role.getDeptTree(roleId)
      const roleResponse = await getRole(roleId)
      role.form = roleResponse.data
      role.openDataScope = true
      role.title = '分配数据权限'

      nextTick(() => {
        deptTreeResponse.then((res) => {
          nextTick(() => {
            if (deptRef.value) {
              deptRef.value.setCheckedKeys(res.checkedKeys)
            }
          })
        })
      })
    } catch (e) {
      console.error('获取数据权限信息失败:', e)
    }
  },

  // 提交按钮（数据权限）
  submitDataScope: async () => {
    if (role.form.roleId != undefined) {
      try {
        role.form.deptIds = role.getDeptAllCheckedKeys()
        await dataScope(role.form)
        ElMessage.success('修改成功') 
        role.openDataScope = false
        role.getList()
      } catch (e) {
        console.error('提交数据权限失败:', e)
      }
    }
  }
})

// ==================== 初始化加载 ====================
role.getList()
</script>
