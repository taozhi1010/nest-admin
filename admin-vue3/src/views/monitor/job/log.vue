<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :inline="true" label-width="68px" :model="queryParams">
      <el-form-item label="任务名称" prop="jobName">
        <el-input v-model="queryParams.jobName" clearable placeholder="请输入任务名称" style="width: 240px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="任务组名" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" clearable placeholder="请选择任务组名" style="width: 240px">
          <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择执行状态" style="width: 240px">
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行时间" style="width: 308px">
        <el-date-picker v-model="dateRange" end-placeholder="结束日期" range-separator="-" start-placeholder="开始日期" type="daterange" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:remove']" icon="Delete" plain type="danger" @click="handleClean">清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button icon="Close" plain type="warning" @click="handleClose">关闭</el-button>
      </el-col>
      <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table v-loading="loading" :data="jobLogList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" label="日志编号" prop="jobLogId" width="80" />
      <el-table-column align="center" label="任务名称" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="任务组名" prop="jobGroup" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ getDictLabel('sys_job_group', scope.row.jobGroup) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="调用目标字符串" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="日志信息" prop="jobMessage" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="执行状态" prop="status">
        <template #default="scope">
          <span>{{ getDictLabel('sys_common_status', scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="执行时间" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
        <template #default="scope">
          <el-button v-hasPermi="['monitor:job:query']" icon="View" link type="primary" @click="handleView(scope.row)">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />

    <!-- 调度日志详细 -->
    <el-dialog v-model="open" append-to-body title="调度日志详细" width="700px">
      <el-form label-width="100px" :model="form">
        <el-row>
          <el-col :span="12">
            <el-form-item label="日志序号：">{{ form.jobLogId }}</el-form-item>
            <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：">{{ form.jobGroup }}</el-form-item>
            <el-form-item label="执行时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用方法：">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="日志信息：">{{ form.jobMessage }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="执行状态：">
              <div v-if="form.status == 0">正常</div>
              <div v-else-if="form.status == 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.status == 1" label="异常信息：">{{ form.exceptionInfo }}</el-form-item>
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
</template>

<script setup name="JobLog">
import { getJob } from '@/api/monitor/job'
import { listJobLog, delJobLog, cleanJobLog } from '@/api/monitor/jobLog'
import { useDict } from '@/composables/useDict'
import { resetForm, addDateRange, download, parseTime } from '@/composables/useCommon'

// ==================== Composables ====================
const { closeOpenPage } = useTab()

const { sys_common_status, sys_job_group, getDictLabel } = useDict('sys_common_status', 'sys_job_group')

const jobLogList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const multiple = ref(true)
const total = ref(0)
const dateRange = ref([])
const route = useRoute()

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: undefined,
    dictType: undefined,
    status: undefined
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询调度日志列表 */
function getList() {
  loading.value = true
  listJobLog(addDateRange(queryParams.value, dateRange.value)).then((response) => {
    jobLogList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}
// 返回按钮
function handleClose() {
  const obj = { path: '/monitor/job' }
  closeOpenPage(obj)
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  resetForm('queryRef')
  handleQuery()
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.jobLogId)
  multiple.value = !selection.length
}
/** 详细按钮操作 */
function handleView(row) {
  open.value = true
  form.value = row
}
/** 删除按钮操作 */
function handleDelete(row) {
  ElMessageBox.confirm(`是否确认删除调度日志编号为"${ids.value}"的数据项?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return delJobLog(ids.value)
    })
    .then(() => {
      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
/** 清空按钮操作 */
function handleClean() {
  ElMessageBox.confirm('是否确认清空所有调度日志数据项?', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return cleanJobLog()
    })
    .then(() => {
      getList()
      ElMessage.success('清空成功')
    })
    .catch(() => {})
}
/** 导出按钮操作 */
function handleExport() {
  download(
    'monitor/jobLog/export',
    {
      ...queryParams.value
    },
    `job_log_${new Date().getTime()}.xlsx`
  )
}

;(() => {
  const jobId = route.params && route.params.jobId
  if (jobId !== undefined && jobId != 0) {
    getJob(jobId).then((response) => {
      queryParams.value.jobName = response.data.jobName
      queryParams.value.jobGroup = response.data.jobGroup
      getList()
    })
  } else {
    getList()
  }
})()

getList()
</script>
