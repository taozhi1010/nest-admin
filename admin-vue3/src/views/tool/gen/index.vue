<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams">
      <el-form-item label="表名称" prop="tableName">
        <el-input v-model="queryParams.tableName" clearable placeholder="请输入表名称" style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input v-model="queryParams.tableComment" clearable placeholder="请输入表描述" style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker v-model="dateRange" end-placeholder="结束日期" range-separator="-" start-placeholder="开始日期" type="daterange" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['tool:gen:code']" icon="Download" plain type="primary" @click="handleGenTable">生成</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['tool:gen:import']" icon="Upload" plain type="info" @click="openImportTable">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['tool:gen:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleEditTable">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['tool:gen:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" label="序号" type="index" width="50">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="表名称" prop="tableName" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="表描述" prop="tableComment" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="实体" prop="className" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="创建时间" prop="createTime" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <span>{{ parseTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="更新时间" prop="updateTime" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <span>{{ parseTime(row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="330">
        <template #default="scope">
          <el-tooltip content="预览" placement="top">
            <el-button v-hasPermi="['tool:gen:preview']" icon="View" link type="primary" @click="handlePreview(scope.row)" />
          </el-tooltip>
          <el-tooltip content="编辑" placement="top">
            <el-button v-hasPermi="['tool:gen:edit']" icon="Edit" link type="primary" @click="handleEditTable(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['tool:gen:remove']" icon="Delete" link type="primary" @click="handleDelete(scope.row)" />
          </el-tooltip>
          <el-tooltip content="同步" placement="top">
            <el-button v-hasPermi="['tool:gen:edit']" icon="Refresh" link type="primary" @click="handleSynchDb(scope.row)" />
          </el-tooltip>
          <el-tooltip content="生成代码" placement="top">
            <el-button v-hasPermi="['tool:gen:code']" icon="Download" link type="primary" @click="handleGenTable(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    <!-- 预览界面 -->
    <el-dialog v-model="preview.open" append-to-body class="scrollbar" :title="preview.title" top="5vh" width="80%">
      <el-tabs v-model="preview.activeName">
        <el-tab-pane v-for="(value, key) in preview.data" :key="value" :label="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))" :name="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))">
          <el-link v-copyText="value" v-copyText:callback="copyTextSuccess" icon="DocumentCopy" style="float: right" :underline="false">&nbsp;复制</el-link>
          <pre>{{ value }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="importRef" @ok="handleQuery" />
  </div>
</template>

<script setup name="Gen">
import { listTable, previewTable, delTable, genCode, synchDb } from '@/api/tool/gen'
import router from '@/router'
import importTable from './importTable'
import { resetForm, addDateRange, parseTime } from '@/composables/useCommon'

const route = useRoute()

const tableList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const tableNames = ref([])
const dateRange = ref([])
const uniqueId = ref('')

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tableName: undefined,
    tableComment: undefined
  },
  preview: {
    open: false,
    title: '代码预览',
    data: {},
    activeName: 'domain.java'
  }
})

const { queryParams, preview } = toRefs(data)

onActivated(() => {
  const time = route.query.t
  if (time != null && time != uniqueId.value) {
    uniqueId.value = time
    queryParams.value.pageNum = Number(route.query.pageNum)
    dateRange.value = []
    resetForm('queryForm')
    getList()
  }
})

/** 查询表集合 */
function getList() {
  loading.value = true
  listTable(addDateRange(queryParams.value, dateRange.value)).then((response) => {
    tableList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 生成代码操作 */
function handleGenTable(row) {
  const tbNames = row.tableName || tableNames.value
  if (tbNames == '') {
    proxy.$modal.msgError('请选择要生成的数据')
    return
  }
  if (row.genType === '1') {
    genCode(row.tableName).then((response) => {
      proxy.$modal.msgSuccess(`成功生成到自定义路径：${row.genPath}`)
    })
  } else {
    proxy.$download.zip(`/tool/gen/batchGenCode/zip?tableNames=${tbNames}`, 'ruoyi.zip')
  }
}
/** 同步数据库操作 */
function handleSynchDb(row) {
  const tableName = row.tableName
  proxy.$modal
    .confirm(`确认要强制同步"${tableName}"表结构吗？`)
    .then(function () {
      return synchDb(tableName)
    })
    .then(() => {
      proxy.$modal.msgSuccess('同步成功')
    })
    .catch(() => {})
}
/** 打开导入表弹窗 */
function openImportTable() {
  proxy.$refs['importRef'].show()
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  resetForm('queryRef')
  resetForm('queryRef')
  handleQuery()
}
/** 预览按钮 */
function handlePreview(row) {
  previewTable(row.tableId).then((response) => {
    preview.value.data = response.data
    preview.value.open = true
    preview.value.activeName = 'entity.ts'
  })
}
/** 复制代码成功 */
function copyTextSuccess() {
  proxy.$modal.msgSuccess('复制成功')
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.tableId)
  tableNames.value = selection.map((item) => item.tableName)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
/** 修改按钮操作 */
function handleEditTable(row) {
  const tableId = row.tableId || ids.value[0]
  router.push({
    path: `/tool/gen-edit/index/${tableId}`,
    query: { pageNum: queryParams.value.pageNum }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const tableIds = row.tableId || ids.value
  proxy.$modal
    .confirm(`是否确认删除表编号为"${tableIds}"的数据项？`)
    .then(function () {
      return delTable(tableIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

getList()
</script>
