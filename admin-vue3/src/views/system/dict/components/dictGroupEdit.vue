<template>
  <!-- 添加或修改数据字典项配置 -->
  <el-dialog :title="form.title" v-model="dialogTableVisible" width="600px" append-to-body>
    <el-form ref="formRef" :model="form.model" :rules="form.rules" label-width="100px">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="form.model.dictName" placeholder="请输入字典名称" />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="form.model.dictType" placeholder="请输入字典类型" />
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
        <el-button type="warning" @click="form.reset">重置</el-button>
        <el-button @click="form.cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { addType, updateType } from '@/api/system/dict/type'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

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
    remark: ''
  },
  rules: {
    dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
    dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }]
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
        if (form.model.dictId != undefined) {
          updateType(form.model).then(() => {
            proxy.$modal.msgSuccess('修改成功')
            form.reset()
            dialogTableVisible.value = false
            emit('refresh')
          })
        } else {
          addType(form.model).then(() => {
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

const handleDialogOpen = (type, row) => {
  form.title = type === 'add' ? '新增字典类型' : '修改字典类型'
  dialogTableVisible.value = true
  if (type === 'edit') {
    form.model = { ...row }
  } else {
    nextTick(() => {
      form.reset()
    })
  }
}

defineExpose({
  handleDialogOpen
})
</script>
