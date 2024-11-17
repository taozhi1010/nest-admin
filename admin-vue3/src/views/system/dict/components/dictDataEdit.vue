<template>
  <!-- 添加或修改数据字典内容配置 -->
  <el-dialog :title="form.title" v-model="dialogTableVisible" width="600px" append-to-body>
    <el-form ref="formRef" :model="form.model" :rules="form.rules" label-width="100px">
      <el-form-item label="字典类型">
        <el-input v-model="form.model.dictType" :disabled="true" />
      </el-form-item>
      <el-form-item label="数据标签" prop="dictLabel">
        <el-input v-model="form.model.dictLabel" placeholder="请输入数据标签" />
      </el-form-item>
      <el-form-item label="数据键值" prop="dictValue">
        <el-input v-model="form.model.dictValue" placeholder="请输入数据键值" />
      </el-form-item>
      <el-form-item label="回显样式" prop="listClass">
        <el-select v-model="form.model.listClass">
          <el-option v-for="item in listClassOptions" :key="item.value" :label="`${item.label}(${item.value})`" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="显示排序" prop="dictSort">
        <el-input-number v-model="form.model.dictSort" controls-position="right" :min="0" />
      </el-form-item>
      <el-form-item prop="cssClass">
        <template #label>
          <el-tooltip effect="dark" :content="tips" placement="top-start">
            <div class="tips">
              <QuestionFilled class="tips-icon" :size="'14px'"/>
            </div>
          </el-tooltip>
          <span style="width: 80px">样式属性</span>
        </template>

        <el-input v-model="form.model.cssClass" placeholder="请输入样式属性" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.model.status">
          <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.model.remark" type="textarea" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="form.loading" type="primary" @click="form.submit">确 定</el-button>
        <el-button @click="form.cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="Data">
import { addData, updateData } from '@/api/system/dict/data'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

// 数据标签回显样式
const listClassOptions = ref([
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主要' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' }
])

const tips = '样式属性代表数据字典的样式，比如：primary、success、info、warning、danger'

const dialogTableVisible = ref(false)
const formRef = ref()
const emit = defineEmits(['refresh'])

const form = reactive({
  loading: false,
  title: '',
  model: {
    dictName: '',
    dictType: null,
    status: '0',
    listClass: 'default',
    remark: ''
  },
  rules: {
    dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
    dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
    dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }],
    listClass: [{ required: true, message: '回显样式不能为空', trigger: 'change' }]
  },
  reset: () => {
    form.loading = false
    nextTick(() => {
      proxy.resetForm('formRef')
    })
  },
  submit: () => {
    formRef.value.validate((valid) => {
      if (valid) {
        form.loading = true
        if (form.model.dictCode != undefined) {
          updateData(form.model).then(() => {
            proxy.$modal.msgSuccess('修改成功')
            form.reset()
            dialogTableVisible.value = false
            emit('refresh')
          })
        } else {
          addData(form.model).then(() => {
            proxy.$modal.msgSuccess('新增成功')
            form.reset()
            dialogTableVisible.value = false
            emit('refresh')
          })
        }
      }
    })
  },
  cancel: () => {
    form.reset()
    dialogTableVisible.value = false
  }
})

const handleDialogOpen = (type, group, row) => {
  form.title = type === 'add' ? `新增-${group.dictName}` : `修改-${group.dictName}`
  dialogTableVisible.value = true

  if (type === 'edit') {
    form.model = Object.assign({}, row)
  } else {
    nextTick(() => {
      form.reset()
      form.model.dictType = group.dictType
    })
  }
}

defineExpose({
  handleDialogOpen
})
</script>
