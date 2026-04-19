<template>
  <el-drawer v-model="drawer.visible" direction="rtl" size="1200px" title="文章详情">
    <el-tabs v-model="drawer.activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="first">
        <h2 class="article-title">{{ form.model.title }}</h2>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="所属专栏">{{ getSubjectName(form.model.subjectId) }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ form.model.author || '-' }}</el-descriptions-item>
          <el-descriptions-item label="文章简介" :span="2">{{ form.model.desc || '-' }}</el-descriptions-item>
          <el-descriptions-item label="封面图片" :span="2">
            <el-image v-if="form.model.cover" :src="form.model.cover" :preview-src-list="[form.model.cover]" style="width: 200px; height: 120px" fit="cover" />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="发布状态">
            <el-tag v-if="form.model.publishStatus === '0'" type="info">草稿</el-tag>
            <el-tag v-else-if="form.model.publishStatus === '1'" type="success">已发布</el-tag>
            <el-tag v-else-if="form.model.publishStatus === '2'" type="warning">已下架</el-tag>
            <el-tag v-else-if="form.model.publishStatus === '3'" type="primary">定时发布</el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag v-if="form.model.auditStatus === '0'" type="warning">待审核</el-tag>
            <el-tag v-else-if="form.model.auditStatus === '1'" type="success">审核通过</el-tag>
            <el-tag v-else-if="form.model.auditStatus === '2'" type="danger">审核拒绝</el-tag>
            <el-tag v-else-if="form.model.auditStatus === '3'" type="info">审核中</el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="点赞数">{{ form.model.likeNum || 0 }}</el-descriptions-item>
          <el-descriptions-item label="阅读数">{{ form.model.readNum || 0 }}</el-descriptions-item>
          <el-descriptions-item label="评论数">{{ form.model.commentNum || 0 }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ form.model.sort || 0 }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ form.model.publishTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="定时发布时间">{{ form.model.scheduledPublishTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ form.model.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最后修改时间">{{ form.model.updateTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane label="文章内容" name="detail">
        <md-viewer :value="form.model.content" />
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup>
import { getArticle } from '@/api/post/article'
import { listSubject } from '@/api/post/subject'
import MdViewer from '@/components/MdViewer'

const drawer = reactive({
  visible: false,
  activeName: 'first',
  title: '新增文章'
})

const form = reactive({
  model: {}
})

const subjectList = ref([])

const getSubjectList = () => {
  listSubject({ pageNum: 1, pageSize: 999 }).then((res) => {
    subjectList.value = res.data.list || []
  }).catch(() => {
    subjectList.value = []
  })
}

const getSubjectName = (subjectId) => {
  if (!subjectId || !subjectList.value || subjectList.value.length === 0) return '-'
  const subject = subjectList.value.find((item) => item.subjectId === subjectId)
  return subject ? subject.subjectName : '-'
}

const handleOpen = (row) => {
  const articleId = row.articleId
  if (!articleId) return
  
  getArticle(articleId).then((res) => {
    drawer.title = `文章详情`
    form.model = res.data || {}
    if (form.model.content && typeof form.model.content === 'string') {
      const content = form.model.content
      if (content.startsWith('"') && content.endsWith('"')) {
        form.model.content = content.slice(1, -1).replace(/\\n/g, '\n')
      }
    }
    if (form.model.updateTime) form.model.updateTime = dayjs(form.model.updateTime).format('YYYY-MM-DD HH:mm:ss')
    if (form.model.createTime) form.model.createTime = dayjs(form.model.createTime).format('YYYY-MM-DD HH:mm:ss')
    if (form.model.publishTime) form.model.publishTime = dayjs(form.model.publishTime).format('YYYY-MM-DD HH:mm:ss')
    if (form.model.scheduledPublishTime) form.model.scheduledPublishTime = dayjs(form.model.scheduledPublishTime).format('YYYY-MM-DD HH:mm:ss')
    drawer.visible = true
  }).catch(() => {
    ElMessage.error('获取文章详情失败')
  })
}

const handleClose = () => {
  drawer.visible = false
}

getSubjectList()

defineExpose({
  handleOpen,
  handleClose
})
</script>

<style lang="scss" scoped>
.article-title {
  width: 100vw;
  font-weight: 600;
  padding: 24px 0;
  margin-bottom: 30px;
  font-size: 1.5em;
  border-bottom: 1px solid rgba(209, 217, 224, 0.7019607843);
}

.desc-label {
  width: 120px;
  font-weight: 800;
}
</style>
