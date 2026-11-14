<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="operlog.showSearch" ref="queryRef" v-no-enter :inline="true" label-width="68px" :model="operlog.queryParams">
      <el-form-item label="系统模块" prop="title">
        <el-input v-model="operlog.queryParams.title" clearable placeholder="请输入系统模块" style="width: 240px" @keyup.enter="operlog.handleQuery" />
      </el-form-item>
      <el-form-item label="操作人员" prop="operName">
        <el-input v-model="operlog.queryParams.operName" clearable placeholder="请输入操作人员" style="width: 240px" @keyup.enter="operlog.handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="businessType">
        <el-select v-model="operlog.queryParams.businessType" clearable placeholder="操作类型" style="width: 240px">
          <el-option v-for="dict in sys_oper_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="operlog.queryParams.status" clearable placeholder="操作状态" style="width: 240px">
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间" style="width: 308px">
        <el-date-picker v-model="dateRange" :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]" end-placeholder="结束日期" range-separator="-" start-placeholder="开始日期" type="daterange" value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="operlog.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:operlog:remove']" :disabled="operlog.multiple" icon="Delete" plain type="danger" @click="operlog.handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:operlog:remove']" icon="Delete" plain type="danger" @click="handleClean">清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:operlog:export']" icon="Download" plain type="warning" @click="operlog.handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:show-search="operlog.showSearch" @query-table="operlog.getList" />
    </el-row>

    <el-table ref="operlogRef" v-loading="operlog.loading" :data="operlog.list" :default-sort="defaultSort" @selection-change="operlog.handleSelectionChange" @sort-change="handleSortChange">
      <el-table-column align="center" type="selection" width="50" />
      <el-table-column align="center" label="日志编号" prop="operId" />
      <el-table-column align="center" label="系统模块" prop="title" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="操作类型" prop="businessType">
        <template #default="scope">
          <span>{{ getDictLabel('sys_oper_type', scope.row.businessType) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作人员" prop="operName" :show-overflow-tooltip="true" :sort-orders="['descending', 'ascending']" sortable="custom" width="110" />
      <el-table-column align="center" label="主机" prop="operIp" :show-overflow-tooltip="true" width="130" />
      <el-table-column align="center" label="操作状态" prop="status">
        <template #default="scope">
          <span>{{ getDictLabel('sys_common_status', scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作日期" prop="operTime" :sort-orders="['descending', 'ascending']" sortable="custom" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.operTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="消耗时间" prop="costTime" :show-overflow-tooltip="true" :sort-orders="['descending', 'ascending']" sortable="custom" width="110">
        <template #default="scope">
          <span>{{ scope.row.costTime }}毫秒</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
        <template #default="scope">
          <el-button v-hasPermi="['monitor:operlog:query']" icon="View" link type="primary" @click="handleView(scope.row, scope.index)">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="operlog.total > 0" v-model:limit="operlog.queryParams.pageSize" v-model:page="operlog.queryParams.pageNum" :total="operlog.total" @pagination="operlog.getList" />

    <!-- 操作日志详细 -->
    <el-dialog v-model="open" append-to-body title="操作日志详细" width="700px">
      <el-form label-width="100px" :model="form">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块：">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
            <el-form-item label="登录信息：">{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="操作状态：">
              <div v-if="form.status === 0">正常</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="消耗时间：">{{ form.costTime }}毫秒</el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="操作时间：">{{ parseTime(form.operTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.status === 1" label="异常信息：">{{ form.errorMsg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script setup name="Operlog">
import { list, delOperlog, cleanOperlog } from '@/api/monitor/operlog'
import { useDict } from '@/composables/useDict'
import { useCrud } from '@/composables/useCrud'
import { addDateRange, parseTime } from '@/composables/useCommon'

const { sys_oper_type, sys_common_status, getDictLabel } = useDict('sys_oper_type', 'sys_common_status')

const operlogRef = ref(null)
const queryRef = ref(null)
const open = ref(false)
const form = ref({})
const dateRange = ref([])
const defaultSort = ref({ prop: 'operTime', order: 'descending' })

// 操作日志列表（无新增/编辑）
const operlog = useCrud({
  api: {
    // 列表查询注入日期范围参数
    list: (params) => list(addDateRange(params, dateRange.value)),
    del: delOperlog
  },
  idKey: 'operId',
  name: '日志',
  query: { title: undefined, operName: undefined, businessType: undefined, status: undefined, orderByColumn: undefined, isAsc: undefined },
  exportUrl: 'monitor/operlog/export',
  queryRef
})

// 重置按钮操作：额外清空日期范围并恢复默认排序
const baseResetQuery = operlog.resetQuery
const resetQuery = () => {
  dateRange.value = []
  baseResetQuery()
  if (operlogRef.value) {
    operlogRef.value.sort(defaultSort.value.prop, defaultSort.value.order)
  }
}

/** 操作日志类型字典翻译 */
function typeFormat(row, column) {
  return getDictLabel('sys_oper_type', row.businessType)
}

/** 排序触发事件 */
function handleSortChange(column) {
  operlog.queryParams.orderByColumn = column.prop
  operlog.queryParams.isAsc = column.order
  operlog.getList()
}

/** 详细按钮操作 */
function handleView(row) {
  open.value = true
  form.value = row
}

/** 清空按钮操作 */
function handleClean() {
  ElMessageBox.confirm('是否确认清空所有操作日志数据项?', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return cleanOperlog()
    })
    .then(() => {
      operlog.getList()
      ElMessage.success('清空成功')
    })
    .catch(() => {})
}

operlog.getList()
</script>
