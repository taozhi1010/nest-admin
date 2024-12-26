<template>
  <el-drawer v-model="drawer.visible" title="文章详情" size="1200px" direction="rtl">
    <MdViewer :value="form.model.content" />
  </el-drawer>
</template>

<script setup>
import { getArticle } from '@/api/game/Article'
import MdViewer from '@/components/MdViewer'

const drawer = reactive({
  visible: false,
  title: '新增文章'
})

const form = reactive({
  model: {}
})

const handleOpen = (row) => {
  const articleId = row.articleId || ids.value
  getArticle(articleId).then((res) => {
    drawer.title = '修改文章'
    form.model = res.data
    form.model.content = form.model.content.slice(1, -1).replace(/\\n/g, '\n')
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

<style lang="scss" scoped></style>
