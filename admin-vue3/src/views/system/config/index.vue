<template>
  <!-- 参数设置 -->
  <div class="app-container">
    <el-form :model="config.queryParams" ref="config.queryRef" :inline="true" v-show="config.showSearch"
      label-width="68px">
      <el-form-item label="参数名称" prop="configName">
        <el-input v-model.trim="config.queryParams.configName" placeholder="请输入参数名称" clearable style="width: 160px"
          @keyup.enter="config.handleQuery" />
      </el-form-item>
      <el-form-item label="参数键名" prop="configKey">
        <el-input v-model.trim="config.queryParams.configKey" placeholder="请输入参数键名" clearable style="width: 160px"
          @keyup.enter="config.handleQuery" />
      </el-form-item>
      <el-form-item label="系统内置" prop="configType">
        <template #label>
          <span style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap">
            <el-tooltip effect="dark" content="系统内置：是代表不可删除，否代表可以删除" placement="top-start">
              <el-icon :size="16">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
            <span>系统内置</span>
          </span>
        </template>
        <el-select v-model="config.queryParams.configType" placeholder="系统内置" clearable style="width: 160px">
          <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 408px">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="config.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="config.resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="config.handleAdd"
          v-hasPermi="['system:config:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="config.multiple" @click="config.handleDelete"
          v-hasPermi="['system:config:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="config.showSearch" @queryTable="config.getList"></right-toolbar>
    </el-row>

    <el-table v-loading="config.loading" :data="config.configList" @selection-change="config.handleSelectionChange">
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
          <el-button link type="primary" icon="Edit" @click="config.handleUpdate(scope.row)"
            v-hasPermi="['system:config:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="config.handleDelete(scope.row)"
            v-hasPermi="['system:config:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="config.total > 0" :total="config.total" v-model:page="config.queryParams.pageNum"
      v-model:limit="config.queryParams.pageSize" @pagination="config.getList" />
  </div>

  <!-- 添加或修改参数配置对话框 -->
  <el-dialog :title="config.title" v-model="config.open" width="600px" append-to-body>
    <el-form v-loading="config.formLoading" ref="configFormRef" :model="config.form" :rules="config.rules"
      label-width="120px">
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
            <el-tooltip effect="dark" content="系统内置：是代表不可删除，否代表可以删除" placement="top-start">
              <el-icon :size="16">
                <QuestionFilled />
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
        <el-input v-model.trim="config.form.remark" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="config.formLoading" type="primary" @click="config.submitForm">确 定</el-button>
        <el-button @click="config.cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="Config">
import { listConfig, addConfig, delConfig, getConfig, updateConfig } from '@/api/system/config'
import { useDict } from '@/composables/useDict'
import { resetForm, download, parseTime } from '@/composables/useCommon'

const { proxy } = getCurrentInstance()
const { sys_yes_no } = useDict('sys_yes_no')

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
    config.ids = selection.map(item => item.configId)
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
          proxy.$modal.msgSuccess('修改成功')
        } else {
          await addConfig(config.form)
          proxy.$modal.msgSuccess('新增成功')
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
      await proxy.$modal.confirm('是否确认删除参数编号为"' + configIds + '"的数据项？')
      await delConfig(configIds)
      proxy.$modal.msgSuccess('删除成功')
      config.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('删除失败:', e)
      }
    }
  },

  // 导出按钮操作
  handleExport: () => {
    download('system/config/export', {
      ...config.queryParams
    }, `config_${new Date().getTime()}.xlsx`)
  }
})

// 初始化加载
config.getList()
</script>
