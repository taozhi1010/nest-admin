<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams">
      <el-form-item label="任务名称" prop="jobName">
        <el-input v-model="queryParams.jobName" clearable placeholder="请输入任务名称" style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="任务组名" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" clearable placeholder="请选择任务组名" style="width: 200px">
          <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择任务状态" style="width: 200px">
          <el-option v-for="dict in sys_job_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:export']" icon="Download" plain type="warning" @click="handleExport">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['monitor:job:query']" icon="Operation" plain type="info" @click="handleJobLog">日志</el-button>
      </el-col>
      <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" label="任务编号" prop="jobId" width="100" />
      <el-table-column align="center" label="任务名称" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="任务组名" prop="jobGroup">
        <template #default="scope">
          <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="调用目标字符串" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="cron执行表达式" prop="cronExpression" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="状态">
        <template #default="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="200">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button v-hasPermi="['monitor:job:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)" />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button v-hasPermi="['monitor:job:remove']" icon="Delete" link type="primary" @click="handleDelete(scope.row)" />
          </el-tooltip>
          <el-tooltip content="执行一次" placement="top">
            <el-button v-hasPermi="['monitor:job:changeStatus']" icon="CaretRight" link type="primary" @click="handleRun(scope.row)" />
          </el-tooltip>
          <el-tooltip content="任务详细" placement="top">
            <el-button v-hasPermi="['monitor:job:query']" icon="View" link type="primary" @click="handleView(scope.row)" />
          </el-tooltip>
          <el-tooltip content="调度日志" placement="top">
            <el-button v-hasPermi="['monitor:job:query']" icon="Operation" link type="primary" @click="handleJobLog(scope.row)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />

    <!-- 添加或修改定时任务对话框 -->
    <el-dialog v-model="open" append-to-body :title="title" width="820px">
      <el-form ref="jobRef" label-width="120px" :model="form" :rules="rules">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="jobName">
              <el-input v-model="form.jobName" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="请选择">
                <el-option v-for="dict in sys_job_group" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="invokeTarget">
              <template #label>
                <span>
                  调用方法
                  <el-tooltip placement="top">
                    <template #content>
                      <div>
                        Bean调用示例：ryTask.ryParams('ry')
                        <br />
                        Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                        <br />
                        参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                      </div>
                    </template>
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="cron表达式" prop="cronExpression">
              <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式">
                <template #append>
                  <el-button type="primary" @click="handleShowCron">
                    生成表达式
                    <i class="el-icon-time el-icon--right"></i>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col v-if="form.jobId !== undefined" :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_job_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行策略" prop="misfirePolicy">
              <el-radio-group v-model="form.misfirePolicy">
                <el-radio-button label="1">立即执行</el-radio-button>
                <el-radio-button label="2">执行一次</el-radio-button>
                <el-radio-button label="3">放弃执行</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发" prop="concurrent">
              <el-radio-group v-model="form.concurrent">
                <el-radio-button label="0">允许</el-radio-button>
                <el-radio-button label="1">禁止</el-radio-button>
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

    <el-dialog v-model="openCron" append-to-body destroy-on-close title="Cron表达式生成器">
      <crontab ref="crontabRef" :expression="expression" @fill="crontabFill" @hide="openCron = false" />
    </el-dialog>

    <!-- 任务日志详细 -->
    <el-dialog v-model="openView" append-to-body title="任务详细" width="700px">
      <el-form label-width="120px" :model="form">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务编号：">{{ form.jobId }}</el-form-item>
            <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：">{{ jobGroupFormat(form) }}</el-form-item>
            <el-form-item label="创建时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="cron表达式：">{{ form.cronExpression }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次执行时间：">{{ parseTime(form.nextValidTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用目标方法：">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务状态：">
              <div v-if="form.status == 0">正常</div>
              <div v-else-if="form.status == 1">暂停</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发：">
              <div v-if="form.concurrent == 0">允许</div>
              <div v-else-if="form.concurrent == 1">禁止</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行策略：">
              <div v-if="form.misfirePolicy == 0">默认策略</div>
              <div v-else-if="form.misfirePolicy == 1">立即执行</div>
              <div v-else-if="form.misfirePolicy == 2">执行一次</div>
              <div v-else-if="form.misfirePolicy == 3">放弃执行</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openView = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Job">
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from '@/api/monitor/job'
import Crontab from '@/components/Crontab'
const router = useRouter()
import { useDict } from '@/composables/useDict'
import { selectDictLabel, parseTime } from '@/composables/useCommon'

const { sys_job_group, sys_job_status } = useDict('sys_job_group', 'sys_job_status')

const jobList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const openView = ref(false)
const openCron = ref(false)
const expression = ref('')

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jobName: undefined,
    jobGroup: undefined,
    status: undefined
  },
  rules: {
    jobName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
    invokeTarget: [{ required: true, message: '调用目标字符串不能为空', trigger: 'blur' }],
    cronExpression: [{ required: true, message: 'cron执行表达式不能为空', trigger: 'change' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询定时任务列表 */
function getList() {
  loading.value = true
  listJob(queryParams.value).then((response) => {
    jobList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}
/** 任务组名字典翻译 */
function jobGroupFormat(row, column) {
  return selectDictLabel(sys_job_group.value, row.jobGroup)
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = {
    jobId: undefined,
    jobName: undefined,
    jobGroup: undefined,
    invokeTarget: undefined,
    cronExpression: undefined,
    misfirePolicy: 1,
    concurrent: 1,
    status: '0'
  }
  resetForm(jobRef)
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  resetForm('queryRef')
  handleQuery()
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.jobId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
// 更多操作触发
function handleCommand(command, row) {
  switch (command) {
    case 'handleRun':
      handleRun(row)
      break
    case 'handleView':
      handleView(row)
      break
    case 'handleJobLog':
      handleJobLog(row)
      break
    default:
      break
  }
}
// 任务状态修改
function handleStatusChange(row) {
  let text = row.status === '0' ? '启用' : '停用'
  proxy.$modal
    .confirm(`确认要"${text}""${row.jobName}"任务吗?`)
    .then(function () {
      return changeJobStatus(row.jobId, row.status)
    })
    .then(() => {
      proxy.$modal.msgSuccess(`${text}成功`)
    })
    .catch(function () {
      row.status = row.status === '0' ? '1' : '0'
    })
}
/* 立即执行一次 */
function handleRun(row) {
  proxy.$modal
    .confirm(`确认要立即执行一次"${row.jobName}"任务吗?`)
    .then(function () {
      return runJob(row.jobId, row.jobGroup)
    })
    .then(() => {
      proxy.$modal.msgSuccess('执行成功')
    })
    .catch(() => {})
}
/** 任务详细信息 */
function handleView(row) {
  getJob(row.jobId).then((response) => {
    form.value = response.data
    openView.value = true
  })
}
/** cron表达式按钮操作 */
function handleShowCron() {
  expression.value = form.value.cronExpression
  openCron.value = true
}
/** 确定后回传值 */
function crontabFill(value) {
  form.value.cronExpression = value
}
/** 任务日志列表查询 */
function handleJobLog(row) {
  const jobId = row.jobId || 0
  router.push(`/monitor/job-log/index/${jobId}`)
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加任务'
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const jobId = row.jobId || ids.value
  getJob(jobId).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改任务'
  })
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['jobRef'].validate((valid) => {
    if (valid) {
      if (form.value.jobId != undefined) {
        updateJob(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addJob(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const jobIds = row.jobId || ids.value
  proxy.$modal
    .confirm(`是否确认删除定时任务编号为"${jobIds}"的数据项?`)
    .then(function () {
      return delJob(jobIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
/** 导出按钮操作 */
function handleExport() {
  download(
    'monitor/job/export',
    {
      ...queryParams.value
    },
    `job_${new Date().getTime()}.xlsx`
  )
}

getList()
</script>
