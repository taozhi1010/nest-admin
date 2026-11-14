<template>
  <!-- 参数设置 -->
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="config.showSearch" ref="queryRef" v-no-enter :inline="true" label-width="68px" :model="config.queryParams">
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

    <el-table v-loading="config.loading" :data="config.list" @selection-change="config.handleSelectionChange">
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
    <el-form ref="configFormRef" v-no-enter v-loading="config.formLoading" label-width="120px" :model="config.form" :rules="rules">
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
import { useCrud } from '@/composables/useCrud'
import { parseTime } from '@/composables/useCommon'

const { sys_yes_no, getDictLabel } = useDict('sys_yes_no')

// 表单 ref
const queryRef = ref()
const configFormRef = ref()

// 表单校验规则
const rules = {
  configName: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
  configKey: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
  configValue: [{ required: true, message: '参数键值不能为空', trigger: 'blur' }]
}

// 参数配置管理
const config = useCrud({
  api: { list: listConfig, get: getConfig, add: addConfig, update: updateConfig, del: delConfig },
  idKey: 'configId',
  name: '参数配置',
  query: { configName: '', configKey: '', configType: null },
  form: { configId: undefined, configName: undefined, configKey: undefined, configValue: undefined, configType: '1', remark: undefined },
  queryRef,
  formRef: configFormRef
})

// 初始化加载
config.getList()
</script>
