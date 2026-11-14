<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="role.showSearch" ref="queryRef" v-no-enter :inline="true" label-width="68px" :model="role.queryParams">
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
        <el-date-picker v-model="dateRange" end-placeholder="结束日期" range-separator="-" start-placeholder="开始日期" type="daterange" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="role.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
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
    <el-table v-loading="role.loading" :data="role.list" @selection-change="role.handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column label="角色编号" prop="roleId" width="120" />
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="显示顺序" prop="roleSort" width="100" />
      <el-table-column align="center" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" style="cursor: pointer;"
            @click="handleStatusClick(scope.row)">
            {{ scope.row.status === '0' ? '启用' : '停用' }}
          </el-tag>
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
            <el-button v-hasPermi="['system:role:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip v-if="scope.row.roleId !== 1" content="删除" placement="top">
            <el-button v-hasPermi="['system:role:remove']" icon="Delete" link type="primary" @click="role.handleDelete(scope.row)" />
          </el-tooltip>
          <el-tooltip v-if="scope.row.roleId !== 1" content="数据权限" placement="top">
            <el-button v-hasPermi="['system:role:edit']" icon="CircleCheck" link type="primary" @click="handleDataScope(scope.row)" />
          </el-tooltip>
          <el-tooltip v-if="scope.row.roleId !== 1" content="分配用户" placement="top">
            <el-button v-hasPermi="['system:role:edit']" icon="User" link type="primary" @click="handleAuthUser(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="role.total > 0" v-model:limit="role.queryParams.pageSize" v-model:page="role.queryParams.pageNum" :total="role.total" @pagination="role.getList" />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog v-model="role.open" append-to-body :title="role.title" width="500px">
      <el-form ref="roleRef" v-no-enter label-width="100px" :model="role.form" :rules="rules">
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
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="role.form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree ref="menuRef" :check-strictly="!role.form.menuCheckStrictly" class="tree-border" :data="menuOptions" empty-text="加载中，请稍候" node-key="id" :props="{ label: 'label', children: 'children' }" show-checkbox />
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
    <el-dialog v-model="openDataScope" append-to-body :title="role.title" width="500px">
      <el-form label-width="80px" :model="role.form">
        <el-form-item label="角色名称">
          <el-input v-model="role.form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="role.form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="role.form.dataScope" @change="dataScopeSelectChange">
            <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-show="role.form.dataScope == 2" label="数据权限">
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">展开/折叠</el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
          <el-checkbox v-model="role.form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">父子联动</el-checkbox>
          <el-tree ref="deptRef" :check-strictly="!role.form.deptCheckStrictly" class="tree-border" :data="deptOptions" default-expand-all empty-text="加载中，请稍候" node-key="id" :props="{ label: 'label', children: 'children' }" show-checkbox />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitDataScope">确 定</el-button>
          <el-button @click="cancelDataScope">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配用户抽屉 -->
    <el-drawer v-model="openAuthUser" append-to-body class="drawer-full-width" direction="rtl" title="分配用户">
      <auth-user ref="authUserRef" :role-id="authUserId" @close="handleCloseAuthUser" />
    </el-drawer>
    </div>
  </div>
</template>

<script setup name="Role">
// ==================== 导入区域 ====================
import AuthUser from './authUser.vue'
import { addRole, changeRoleStatus, dataScope, delRole, getRole, listRole, updateRole, deptTreeSelect } from '@/api/system/role'
import { roleMenuTreeselect, treeselect as menuTreeselect } from '@/api/system/menu'
import { useDict } from '@/composables/useDict'
import { useCrud } from '@/composables/useCrud'
import { addDateRange, parseTime } from '@/composables/useCommon'

// ==================== 实例和字典 ====================
const { sys_normal_disable } = useDict('sys_normal_disable')

// ==================== 表单引用 ====================
const roleRef = ref(null)
const menuRef = ref(null)
const deptRef = ref(null)
const authUserRef = ref(null)
const queryRef = ref(null)

// ==================== 页面特有状态 ====================
const dateRange = ref([])
const menuOptions = ref([])
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const deptOptions = ref([])
const openDataScope = ref(false)
const openAuthUser = ref(false)
const authUserId = ref(undefined)

// 数据范围选项
const dataScopeOptions = [
  { value: '1', label: '全部数据权限' },
  { value: '2', label: '自定数据权限' },
  { value: '3', label: '本部门数据权限' },
  { value: '4', label: '本部门及以下数据权限' },
  { value: '5', label: '仅本人数据权限' }
]

// 表单校验规则
const rules = {
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
  roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
}

// ==================== 树辅助方法 ====================

// 查询菜单树结构
const getMenuTreeselect = async () => {
  try {
    const response = await menuTreeselect()
    menuOptions.value = response.data
  } catch (e) {
    console.error('获取菜单树失败:', e)
  }
}

// 根据角色 ID 查询菜单树结构
const getRoleMenuTreeselect = async (roleId) => {
  try {
    const response = await roleMenuTreeselect(roleId)
    menuOptions.value = response.data.menus
    return response
  } catch (e) {
    console.error('获取角色菜单失败:', e)
    throw e
  }
}

// 根据角色 ID 查询部门树结构
const getDeptTree = async (roleId) => {
  try {
    const response = await deptTreeSelect(roleId)
    deptOptions.value = response.data.depts
    return response
  } catch (e) {
    console.error('获取部门树失败:', e)
    throw e
  }
}

// 重置菜单/部门树的勾选与展开状态
const resetTreeState = () => {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([])
  }
  menuExpand.value = false
  menuNodeAll.value = false
  deptExpand.value = true
  deptNodeAll.value = false
}

// 树权限（展开/折叠）
const handleCheckedTreeExpand = (value, type) => {
  if (type == 'menu') {
    let treeList = menuOptions.value
    for (let i = 0; i < treeList.length; i++) {
      menuRef.value.store.nodesMap[treeList[i].id].expanded = value
    }
  } else if (type == 'dept') {
    let treeList = deptOptions.value
    for (let i = 0; i < treeList.length; i++) {
      deptRef.value.store.nodesMap[treeList[i].id].expanded = value
    }
  }
}

// 树权限（全选/全不选）
const handleCheckedTreeNodeAll = (value, type) => {
  if (type == 'menu') {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : [])
  } else if (type == 'dept') {
    deptRef.value.setCheckedNodes(value ? deptOptions.value : [])
  }
}

// 树权限（父子联动）
const handleCheckedTreeConnect = (value, type) => {
  if (type == 'menu') {
    role.form.menuCheckStrictly = value ? true : false
  } else if (type == 'dept') {
    role.form.deptCheckStrictly = value ? true : false
  }
}

// 所有菜单节点数据
const getMenuAllCheckedKeys = () => {
  // 目前被选中的菜单节点
  let checkedKeys = menuRef.value.getCheckedKeys()
  // 半选中的菜单节点
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
  return checkedKeys
}

// 所有部门节点数据
const getDeptAllCheckedKeys = () => {
  // 目前被选中的部门节点
  let checkedKeys = deptRef.value.getCheckedKeys()
  // 半选中的部门节点
  let halfCheckedKeys = deptRef.value.getHalfCheckedKeys()
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
  return checkedKeys
}

// ==================== 角色管理（CRUD 状态机） ====================
const role = useCrud({
  api: {
    // 列表查询注入日期范围参数
    list: (params) => listRole(addDateRange(params, dateRange.value)),
    // 详情查询：附加角色排序类型转换与菜单树勾选
    get: async (roleId) => {
      const response = await getRole(roleId)
      if (response.data) {
        response.data.roleSort = Number(response.data.roleSort)
      }
      // 获取角色菜单权限
      const roleMenuResponse = await getRoleMenuTreeselect(roleId)
      nextTick(() => {
        let checkedKeys = roleMenuResponse.data.checkedKeys
        checkedKeys.forEach((v) => {
          nextTick(() => {
            menuRef.value.setChecked(v, true, false)
          })
        })
      })
      return response
    },
    // 新增/修改前挂载选中的菜单节点
    add: (data) => {
      data.menuIds = getMenuAllCheckedKeys()
      return addRole(data)
    },
    update: (data) => {
      data.menuIds = getMenuAllCheckedKeys()
      return updateRole(data)
    },
    del: delRole
  },
  idKey: 'roleId',
  name: '角色',
  query: { roleName: undefined, roleKey: undefined, status: undefined },
  exportUrl: 'system/role/export',
  form: {
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
  },
  queryRef,
  formRef: roleRef
})

// ==================== 查询与导出 ====================

// 重置按钮操作：额外清空日期范围
const baseResetQuery = role.resetQuery
const resetQuery = () => {
  dateRange.value = []
  baseResetQuery()
}

// ==================== 新增/修改（先重置树状态） ====================

const crudHandleAdd = role.handleAdd
const handleAdd = () => {
  resetTreeState()
  getMenuTreeselect()
  crudHandleAdd()
}

const crudHandleUpdate = role.handleUpdate
const handleUpdate = async (row) => {
  resetTreeState()
  await crudHandleUpdate(row)
}

// ==================== 页面特有操作 ====================

// 点击状态标签切换状态
const handleStatusClick = async (row) => {
  const currentStatus = row.status
  const newStatus = currentStatus === '0' ? '1' : '0'
  let text = newStatus === '0' ? '启用' : '停用'
  try {
    await ElMessageBox.confirm(`确认要"${text}" "${row.roleName}"角色吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await changeRoleStatus(row.roleId, newStatus)
    ElMessage.success(`${text}成功`)
    row.status = newStatus
  } catch (e) {
    if (e !== 'cancel') {
      console.error('状态修改失败:', e)
    }
  }
}

// 分配用户
const handleAuthUser = (row) => {
  authUserId.value = row.roleId
  openAuthUser.value = true
}

// 关闭分配用户抽屉
const handleCloseAuthUser = () => {
  openAuthUser.value = false
  authUserId.value = undefined
}

// 选择角色权限范围触发
const dataScopeSelectChange = (value) => {
  if (value !== '2') {
    deptRef.value.setCheckedKeys([])
  }
}

// 分配数据权限操作
const handleDataScope = async (row) => {
  resetTreeState()
  role.reset()
  const roleId = row.roleId
  try {
    const deptTreeResponse = await getDeptTree(roleId)
    const roleResponse = await getRole(roleId)
    role.form = roleResponse.data
    openDataScope.value = true
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
}

// 取消按钮（数据权限）
const cancelDataScope = () => {
  openDataScope.value = false
  resetTreeState()
  role.reset()
}

// 提交按钮（数据权限）
const submitDataScope = async () => {
  if (role.form.roleId != undefined) {
    try {
      role.form.deptIds = getDeptAllCheckedKeys()
      await dataScope(role.form)
      ElMessage.success('修改成功')
      openDataScope.value = false
      role.getList()
    } catch (e) {
      console.error('提交数据权限失败:', e)
    }
  }
}

// ==================== 初始化加载 ====================
role.getList()
</script>
