<template>
  <el-drawer v-model="open" :title="title" size="50%">
    <el-form ref="formRef" v-no-enter label-width="120px" :model="formData" :rules="formRules">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="文章标题" prop="title">
            <el-input v-model="formData.title" clearable maxlength="100" placeholder="请输入文章标题" show-word-limit @blur="handleTitleBlur" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属专栏" prop="subjectId">
            <el-select v-model="formData.subjectId" clearable placeholder="请选择专栏" style="width: 100%">
              <el-option v-for="item in subjectList" :key="item.id" :label="item.title" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="文章简介" prop="desc">
        <el-input v-model="formData.desc" maxlength="500" placeholder="请输入文章简介" :rows="3" :show-word-limit="true" type="textarea" @blur="handleDescBlur" />
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <el-input v-model="formData.content" placeholder="请输入文章内容" :rows="8" type="textarea" @blur="handleContentBlur" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="封面图片" prop="cover">
            <ImageUploadCover v-model="formData.cover" path="article" :max-size="5" :quality="0.85" :before-upload-check="validateBeforeUpload" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="作者" prop="author">
            <el-input v-model="formData.author" clearable placeholder="请输入作者昵称" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="发布状态" prop="publishStatus">
            <el-select v-model="formData.publishStatus" clearable placeholder="请选择发布状态" style="width: 100%">
              <el-option v-for="dict in post_article_publish_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="审核状态" prop="auditStatus">
            <el-select v-model="formData.auditStatus" clearable placeholder="请选择审核状态" style="width: 100%">
              <el-option v-for="dict in post_article_audit_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="定时发布时间" prop="scheduledPublishTime">
            <el-date-picker v-model="formData.scheduledPublishTime" clearable placeholder="选择定时发布时间" style="width: 100%" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" controls-position="right" placeholder="请输入排序" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="handleCancel">取 消</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup name="ArticleForm">
import { ref, reactive, watch } from 'vue'
import { addArticle, updateArticle } from '@/api/post/article'
import { useDict } from '@/composables/useDict'
import ImageUploadCover from '@/components/ImageUploadCover/index.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  subjectList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const { post_article_publish_status, post_article_audit_status } = useDict('post_article_publish_status', 'post_article_audit_status')

const formRef = ref(null)
const open = ref(false)
const formData = reactive({
  id: undefined,
  articleId: undefined,
  title: undefined,
  subjectId: undefined,
  desc: undefined,
  content: undefined,
  cover: undefined,
  author: undefined,
  publishTime: undefined,
  likeNum: 0,
  readNum: 0,
  commentNum: 0,
  publishStatus: '0',
  auditStatus: '0',
  scheduledPublishTime: undefined,
  sort: 0
})

const formRules = {
  title: [{ required: true, message: '文章标题不能为空', trigger: 'blur' }],
  subjectId: [{ required: true, message: '所属专栏不能为空', trigger: 'change' }],
  desc: [{ required: true, message: '文章简介不能为空', trigger: 'blur' }]
}

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  open.value = val
  if (val && props.initialData && Object.keys(props.initialData).length > 0) {
    // 如果有初始数据，则填充表单
    // 确保 id 和 articleId 字段都正确设置（兼容两种字段名）
    const data = { ...props.initialData }
    // 如果后端返回的是 id，则同步到 articleId
    if (!data.articleId && data.id) {
      data.articleId = data.id
    }
    // 如果后端返回的是 articleId，则同步到 id
    if (!data.id && data.articleId) {
      data.id = data.articleId
    }
    Object.assign(formData, data)
  } else if (val) {
    // 否则重置表单
    resetForm()
  }
})

// 监听 open 变化
watch(open, (val) => {
  emit('update:modelValue', val)
})

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    articleId: undefined,
    title: undefined,
    subjectId: undefined,
    desc: undefined,
    content: undefined,
    cover: undefined,
    author: undefined,
    publishTime: undefined,
    likeNum: 0,
    readNum: 0,
    commentNum: 0,
    publishStatus: '0',
    auditStatus: '0',
    scheduledPublishTime: undefined,
    sort: 0
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 取消操作
const handleCancel = () => {
  open.value = false
  resetForm()
}

// 提交表单
const handleSubmit = () => {
  if (formRef.value) {
    formRef.value.validate((valid) => {
      if (valid) {
        const submitData = { ...formData }
        // 确保 id 和 articleId 字段同步
        if (submitData.articleId && !submitData.id) {
          submitData.id = submitData.articleId
        }
        if (submitData.id && !submitData.articleId) {
          submitData.articleId = submitData.id
        }
        // 判断是新增还是修改：只要有 id 或 articleId 就认为是修改
        const articleId = submitData.id || submitData.articleId
        if (articleId != undefined) {
          updateArticle(submitData).then((res) => {
            ElMessage.success('修改成功')
            open.value = false
            resetForm()
            emit('success')
          })
        } else {
          addArticle(submitData).then((res) => {
            ElMessage.success('新增成功')
            open.value = false
            resetForm()
            emit('success')
          })
        }
      }
    })
  }
}

// 输入框失去焦点处理
const handleTitleBlur = () => {
  formData.title = formData.title.trim()
}

const handleDescBlur = () => {
  formData.desc = formData.desc.trim()
}

const handleContentBlur = () => {
  formData.content = formData.content.trim()
}

// 上传前验证：必须填写标题和简介
const validateBeforeUpload = () => {
  if (!formData.title || !formData.title.trim()) {
    ElMessage.warning('请先填写文章标题')
    return false
  }
  if (!formData.desc || !formData.desc.trim()) {
    ElMessage.warning('请先填写文章简介')
    return false
  }
  return true
}

// 暴露方法给父组件
defineExpose({
  resetForm,
  setFormData: (data) => {
    Object.assign(formData, data)
  }
})
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
