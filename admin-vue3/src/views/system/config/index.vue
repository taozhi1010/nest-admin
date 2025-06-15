<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="参数名称" prop="configName">
        <el-input v-model="queryParams.configName" placeholder="请输入参数名称" clearable style="width: 160px" @keyup.enter="configTable.onSearch" />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input v-model="queryParams.configKey" placeholder="请输入参数键名" clearable style="width: 160px" @keyup.enter="configTable.onSearch" />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType" label-width="120px">
        <template #label>
          <el-tooltip effect="dark" content="系统内置，代表该行配置不可删除，是代表不可删除，否代表可以删除" placement="top-start">
            <div class="tips">
              <div class="tips-icon tips-item">
                <QuestionFilled />
              </div>
              <div class="tips-text tips-item">系统内置</div>
            </div>
          </el-tooltip>
        </template>
        <el-select v-model="queryParams.configType" placeholder="系统内置" clearable style="width: 160px">
          <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 408px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="configTable.onSearch">搜索</el-button>
        <el-button icon="Refresh" @click="configTable.onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:config:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['system:config:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:config:remove']">删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:config:export']">导出</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button type="danger" plain icon="Refresh" @click="handleRefreshCache" v-hasPermi="['system:config:remove']">刷新缓存</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="configTable.request"></right-toolbar>
    </el-row>

    <el-table v-loading="configTable.state.loading" :data="configTable.state.list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="参数主键" align="center" prop="configId" width="85" />
      <el-table-column label="参数名称" align="center" prop="configName" :show-overflow-tooltip="true" />
      <el-table-column label="参数键名" align="center" prop="configKey" :show-overflow-tooltip="true" />
      <el-table-column label="参数键值" align="center" prop="configValue" :show-overflow-tooltip="true" />
      <el-table-column label="系统内置" align="center" prop="configType">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.configType" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:config:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:config:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="configTable.state.page.total > 0"
      :total="configTable.state.page.total"
      v-model:page="configTable.state.page.pageNum"
      v-model:limit="configTable.state.page.pageSize"
      @pagination="configTable.request"
    />
  </div>

  <!-- 添加或修改参数配置对话框 -->
  <el-dialog :title="configForm.state.title" v-model="configForm.state.open" width="600px" append-to-body>
    <el-form v-loading="configForm.state.loading" ref="configFormRef" :model="configForm.state.form" :rules="rules" label-width="120px">
      <el-form-item label="参数名称" prop="configName">
        <el-input v-model="configForm.state.form.configName" placeholder="请输入参数名称" />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input v-model="configForm.state.form.configKey" placeholder="请输入参数键名" />
      </el-form-item>
      <el-form-item label="参数键值" prop="configValue">
        <el-input v-model="configForm.state.form.configValue" placeholder="请输入参数键值" />
      </el-form-item>
      <el-form-item prop="configType">
        <template #label>
          <el-tooltip effect="dark" content="系统内置，代表该行配置不可删除，是代表不可删除，否代表可以删除" placement="top-start">
            <div class="tips">
              <div class="tips-icon tips-item">
                <QuestionFilled />
              </div>
              <div class="tips-text tips-item">系统内置</div>
            </div>
          </el-tooltip>
        </template>
        <el-radio-group v-model="configForm.state.form.configType">
          <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="configForm.state.form.remark" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="configForm.state.loading" type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="handleCancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="Config">
const { proxy } = getCurrentInstance()
const { sys_yes_no } = proxy.useDict('sys_yes_no')

import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from '@/api/system/config'

import useTable from '@/hooks/useTable'
import useForm from '@/hooks/useForm'

// 列表
const queryRef = ref()
const queryParams = reactive({
  noticeTitle: '',
  createBy: null,
  status: null
})
const configTable = useTable({ get: listConfig }, queryParams, queryRef)

// 表单
const configFormRef = ref()
const rules = {
  configName: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
  configKey: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
  configValue: [{ required: true, message: '参数键值不能为空', trigger: 'blur' }]
}
const configForm = useForm({ add: addConfig, update: updateConfig, delete: delConfig, get: getConfig }, configFormRef, 'configId')

const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

// 新增操作
const handleAdd = () => {
  configForm.onOpenForm()
}

// 修改操作
const handleUpdate = (row) => {
  configForm.onOpenForm(row)
}

// 提交按钮
const handleSubmit = () => {
  configFormRef.value.validate((valid) => {
    if (valid) {
      configForm.onSubmit().then(() => {
        configTable.request()
      })
    }
  })
}

// 取消弹窗
const handleCancel = () => {
  configForm.onCancel()
}

// 多选框选中数据
const handleSelectionChange = (selection) => {
  ids.value = selection.map((item) => item.configId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 删除操作
const handleDelete = (row) => {
  const configId = row.configId || ids.value
  ElMessageBox.confirm('您确认删除该参数吗？', '删除提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    configForm.onRowDelete(configId).then(() => {
      configTable.request()
    })
  })
}

// /** 导出按钮操作 */
// function handleExport() {
//   proxy.download(
//     'system/config/export',
//     {
//       ...queryParams.value
//     },
//     `config_${new Date().getTime()}.xlsx`
//   )
// }
// /** 刷新缓存按钮操作 */
// function handleRefreshCache() {
//   refreshCache().then(() => {
//     proxy.$modal.msgSuccess('刷新缓存成功')
//   })
// }
</script>
