<template>
  <el-drawer v-model="drawer.visible" title="文章详情" size="80vw" direction="rtl">
    {{ form.model.content }}
  </el-drawer>
</template>

<script setup>
import { getArticle } from '@/api/game/Article'
const drawer = reactive({
  visible: false,
  title: '新增文章'
})

const form = reactive({
  model: {}
})

const handleOpen = (row) => {
  drawer.visible = true
  const articleId = row.articleId || ids.value
  getArticle(articleId).then((res) => {
    console.log(res, '测试>>>')
    form.model = res.data
    drawer.title = '修改文章'
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
