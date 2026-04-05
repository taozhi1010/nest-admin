<template>
  <!-- 参数设置 -->
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="config.showSearch" ref="config.queryRef" :inline="true" label-width="68px" :model="config.queryParams">
        <el-form-item label="参数名称" prop="configName">
        <el-input v-model.trim="config.queryParams.configName" clearable placeholder="请输入参数名称" style="width: 160px" @keyup.enter="config.handleQuery" />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input v-model.trim="config.queryParams.configKey" clearable placeholder="请输入参数键名" style="width: 160px" @keyup.enter="config.handleQuery" />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType">
        <template #label>
          <span style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap">
            <el-tooltip content="系统内置：是代表不可删除，否代表可以删除" effect="dark" placement="top-start">
              <el-icon :size="16">
                <question-filled />
              </el-icon>
            </el-tooltip>
            <span>系统内置</span>
          </span>
        </template>
        <el-select v-model="config.queryParams.configType" clearable placeholder="系统内置" style="width: 160px">
          <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 408px">
        <el-date-picker v-model="dateRange" end-placeholder="结束日期" range-separator="-" start-placeholder="开始日期" type="daterange" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="config.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="config.resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:config:add']" icon="Plus" plain type="primary" @click="config.handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:config:remove']" :disabled="config.multiple" icon="Delete" plain type="danger" @click="config.handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:show-search="config.showSearch" @query-table="config.getList" />
    </el-row>

    <el-table v-loading="config.loading" :data="config.configList" @selection-change="config.handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" label="参数主键" prop="configId" width="85" />
      <el-table-column align="center" label="参数名称" prop="configName" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="参数键名" prop="configKey" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="参数键值" prop="configValue" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="系统内置" prop="configType">
        <template #default="scope">
          <span>{{ getDictLabel('sys_yes_no', scope.row.configType) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column align="center" label="创建时间" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="150">
        <template #default="scope">
          <el-button v-hasPermi="['system:config:edit']" icon="Edit" link type="primary" @click="config.handleUpdate(scope.row)">修改</el-button>
          <el-button v-hasPermi="['system:config:remove']" icon="Delete" link type="primary" @click="config.handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="config.total > 0" v-model:limit="config.queryParams.pageSize" v-model:page="config.queryParams.pageNum" :total="config.total" @pagination="config.getList" />
  </div>

  <!-- 添加或修改参数配置对话框 -->
  <el-dialog v-model="config.open" append-to-body :title="config.title" width="600px">
    <el-form ref="configFormRef" v-loading="config.formLoading" label-width="120px" :model="config.form" :rules="config.rules">
      <el-form-item label="参数名称" prop="configName">
        <el-input v-model.trim="config.form.configName" placeholder="请输入参数名称" />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input v-model.trim="config.form.configKey" placeholder="请输入参数键名" />
      </el-form-item>
      <el-form-item label="参数键值" prop="configValue">
        <el-input v-model.trim="config.form.configValue" placeholder="请输入参数键值" />
      </el-form-item>
      <el-form-item prop="configType">
        <template #label>
          <span style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap">
            <el-tooltip content="系统内置：是代表不可删除，否代表可以删除" effect="dark" placement="top-start">
              <el-icon :size="16">
                <question-filled />
              </el-icon>
            </el-tooltip>
            <span>系统内置</span>
          </span>
        </template>
        <el-radio-group v-model="config.form.configType">
          <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model.trim="config.form.remark" placeholder="请输入内容" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="config.formLoading" type="primary" @click="config.submitForm">确 定</el-button>
        <el-button @click="config.cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
  </div>
</template>

<script setup name="Config">
import { listConfig, addConfig, delConfig, getConfig, updateConfig } from '@/api/system/config'
import { useDict } from '@/composables/useDict'
import { resetForm, download, parseTime } from '@/composables/useCommon'

const { sys_yes_no, getDictLabel } = useDict('sys_yes_no')

// 表单 ref
const queryRef = ref()
const configFormRef = ref()

// 参数配置管理
const config = reactive({
  // 响应式数据
  queryRef: null,
  configList: [],
  open: false,
  loading: true,
  formLoading: false,
  showSearch: true,
  ids: [],
  single: true,
  multiple: true,
  total: 0,
  title: '',

  // 表单和查询参数
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: '',
    configKey: '',
    configType: null
  },
  rules: {
    configName: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
    configKey: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
    configValue: [{ required: true, message: '参数键值不能为空', trigger: 'blur' }]
  },

  // 查询参数列表
  getList: async () => {
    config.loading = true
    try {
      const response = await listConfig(config.queryParams)
      config.configList = response.data.list
      config.total = response.data.total
    } finally {
      config.loading = false
    }
  },

  // 取消按钮
  cancel: () => {
    config.open = false
    config.reset()
  },

  // 表单重置
  reset: () => {
    config.form = {
      configId: undefined,
      configName: undefined,
      configKey: undefined,
      configValue: undefined,
      configType: '1',
      remark: undefined
    }
    resetForm(configFormRef)
  },

  // 搜索按钮操作
  handleQuery: () => {
    config.queryParams.pageNum = 1
    config.getList()
  },

  // 重置按钮操作
  resetQuery: () => {
    resetForm(config.queryRef)
    config.handleQuery()
  },

  // 多选框选中数据
  handleSelectionChange: (selection) => {
    config.ids = selection.map((item) => item.configId)
    config.single = selection.length !== 1
    config.multiple = !selection.length
  },

  // 新增按钮操作
  handleAdd: () => {
    config.reset()
    config.open = true
    config.title = '添加参数配置'
  },

  // 修改按钮操作
  handleUpdate: async (row) => {
    config.reset()
    const configId = row.configId || config.ids
    try {
      const response = await getConfig(configId)
      config.form = response.data
      config.open = true
      config.title = '修改参数配置'
    } catch (e) {
      console.error('获取参数配置信息失败:', e)
    }
  },

  // 提交按钮
  submitForm: () => {
    configFormRef.value.validate(async (valid) => {
      if (!valid) return

      try {
        if (config.form.configId !== undefined) {
          await updateConfig(config.form)
          ElMessage.success('修改成功')
        } else {
          await addConfig(config.form)
          ElMessage.success('新增成功')
        }
        config.open = false
        config.getList()
      } catch (e) {
        console.error('提交失败:', e)
      }
    })
  },

  // 删除按钮操作
  handleDelete: async (row) => {
    const configIds = row.configId || config.ids
    try {
      await ElMessageBox.confirm(`是否确认删除参数编号为"${configIds}"的数据项？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await delConfig(configIds)
      ElMessage.success('删除成功')
      config.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('删除失败:', e)
      }
    }
  },

  // 导出按钮操作
  handleExport: () => {
    download(
      'system/config/export',
      {
        ...config.queryParams
      },
      `config_${new Date().getTime()}.xlsx`
    )
  }
})

// 初始化加载
config.getList()
</script>
