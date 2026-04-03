<template>
  <!-- 导入表 -->
  <el-dialog v-model="visible" append-to-body title="导入表" top="5vh" width="800px">
    <el-form ref="queryRef" :inline="true" :model="queryParams">
      <el-form-item label="表名称" prop="tableName">
        <el-input v-model="queryParams.tableName" clearable placeholder="请输入表名称" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="表描述" prop="tableComment">
        <el-input v-model="queryParams.tableComment" clearable placeholder="请输入表描述" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table ref="table" :data="dbTableList" height="260px" @row-click="clickRow" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="表名称" prop="tableName" :show-overflow-tooltip="true" />
        <el-table-column label="表描述" prop="tableComment" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" prop="createTime" />
        <el-table-column label="更新时间" prop="updateTime" />
      </el-table>
      <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleImportTable">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { listDbTable, importTable } from '@/api/tool/gen'

const total = ref(0)
const visible = ref(false)
const tables = ref([])
const dbTableList = ref([])
import { resetForm } from '@/composables/useCommon'

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tableName: undefined,
  tableComment: undefined
})

const emit = defineEmits(['ok'])

/** 查询参数列表 */
function show() {
  getList()
  visible.value = true
}
/** 单击选择行 */
function clickRow(row) {
  proxy.$refs.table.toggleRowSelection(row)
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  tables.value = selection.map((item) => item.tableName)
}
/** 查询表数据 */
function getList() {
  listDbTable(queryParams).then((res) => {
    dbTableList.value = res.data.list
    total.value = res.data.total
  })
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  resetForm(queryRef)
  handleQuery()
}
/** 导入按钮操作 */
function handleImportTable() {
  const tableNames = tables.value.join(',')
  if (tableNames == '') {
    proxy.$modal.msgError('请选择要导入的表')
    return
  }
  importTable({ tableNames: tableNames }).then((res) => {
    proxy.$modal.msgSuccess(res.msg)
    if (res.code === 200) {
      visible.value = false
      emit('ok')
    }
  })
}

defineExpose({
  show
})
</script>
