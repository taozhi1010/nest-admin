<template>
  <el-drawer v-model="drawer.visible" title="文章详情" size="1200px" direction="rtl">
    <el-tabs v-model="drawer.activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="first">
        <h2 class="article-title">{{ form.model.title }}</h2>
        <el-descriptions direction="vertical">
          <el-descriptions-item label="文章简介" :span="3" label-class-name="desc-label">{{ form.model.remark }}</el-descriptions-item>
          <el-descriptions-item label="发布时间" label-class-name="desc-label">{{ form.model.publishTime }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" label-class-name="desc-label">{{ form.model.createTime }}</el-descriptions-item>
          <el-descriptions-item label="最后修改时间" :label-class-name="'desc-label'">{{ form.model.updateTime }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane label="文章内容" name="detail">
        <MdViewer :value="form.model.content" />
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup>
import { getArticle } from '@/api/game/Article'
import MdViewer from '@/components/MdViewer'

const drawer = reactive({
  visible: false,
  activeName: 'first',
  title: '新增文章'
})

const form = reactive({
  model: {}
})

const handleOpen = (row) => {
  const articleId = row.articleId || ids.value
  getArticle(articleId).then((res) => {
    drawer.title = `修改-${form.model.title}`
    form.model = res.data
    form.model.content = form.model.content.slice(1, -1).replace(/\\n/g, '\n')

    form.model.updateTime = dayjs(form.model.updateTime).format('YYYY-MM-DD HH:mm:ss')
    form.model.createTime = dayjs(form.model.createTime).format('YYYY-MM-DD HH:mm:ss')
    form.model.publishTime = dayjs(form.model.publishTime).format('YYYY-MM-DD HH:mm:ss')
    drawer.visible = true
  })
}
const handleClose = () => {
  drawer.visible = false
}

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
