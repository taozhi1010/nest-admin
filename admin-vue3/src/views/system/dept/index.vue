<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams">
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="queryParams.deptName" clearable placeholder="请输入部门名称" style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="部门状态" style="width: 200px">
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:dept:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button icon="Sort" plain type="info" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table v-if="refreshTable" v-loading="loading" :data="deptList" :default-expand-all="isExpandAll" row-key="deptId" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column label="部门名称" prop="deptName" width="260" />
      <el-table-column label="排序" prop="orderNum" width="200" />
      <el-table-column label="状态" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="200">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
        <template #default="scope">
          <el-button v-hasPermi="['system:dept:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button v-hasPermi="['system:dept:add']" icon="Plus" link type="primary" @click="handleAdd(scope.row)">新增</el-button>
          <el-button v-if="scope.row.parentId != 0" v-hasPermi="['system:dept:remove']" icon="Delete" link type="primary" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog v-model="open" append-to-body :title="title" width="600px">
      <el-form ref="deptRef" label-width="80px" :model="form" :rules="rules">
        <el-row>
          <el-col v-if="form.parentId !== 0" :span="24">
            <el-form-item label="上级部门" prop="parentId">
              <el-tree-select v-model="form.parentId" check-strictly :data="deptOptions" placeholder="选择上级部门" :props="{ value: 'deptId', label: 'deptName', children: 'children' }" value-key="deptId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" maxlength="20" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" maxlength="11" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" maxlength="50" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script setup name="Dept">
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from '@/api/system/dept'
import { useDict } from '@/composables/useDict'
import { resetForm, handleTree, parseTime } from '@/composables/useCommon'

const { sys_normal_disable } = useDict('sys_normal_disable')

const deptList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref('')
const deptOptions = ref([])
const isExpandAll = ref(true)
const refreshTable = ref(true)
const deptRef = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    deptName: undefined,
    status: undefined
  },
  rules: {
    parentId: [{ required: true, message: '上级部门不能为空', trigger: 'blur' }],
    deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
    orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询部门列表 */
function getList() {
  loading.value = true
  listDept(queryParams.value).then((response) => {
    deptList.value = handleTree(response.data, 'deptId')
    loading.value = false
  })
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: '0'
  }
  resetForm(deptRef)
}
/** 搜索按钮操作 */
function handleQuery() {
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  resetForm(queryRef)
  handleQuery()
}
/** 新增按钮操作 */
function handleAdd(row) {
  reset()
  listDept().then((response) => {
    deptOptions.value = handleTree(response.data, 'deptId')
  })
  if (row != undefined) {
    form.value.parentId = row.deptId
  }
  open.value = true
  title.value = '添加部门'
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  listDeptExcludeChild(row.deptId).then((response) => {
    deptOptions.value = handleTree(response.data, 'deptId')
  })
  getDept(row.deptId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改部门'
  })
}
/** 提交按钮 */
function submitForm() {
  deptRef.value.validate((valid) => {
    if (valid) {
      if (form.value.deptId != undefined) {
        updateDept(form.value).then((response) => {
          ElMessage.success('修改成功')
          open.value = false
          getList()
        })
      } else {
        addDept(form.value).then((response) => {
          ElMessage.success('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  ElMessageBox.confirm(`是否确认删除名称为"${row.deptName}"的数据项?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return delDept(row.deptId)
    })
    .then(() => {
      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

getList()
</script>
