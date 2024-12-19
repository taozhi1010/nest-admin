<template>
  <el-drawer v-model="drawer.visible" title="文章详情" size="80vw" direction="rtl">游戏文章详情操作</el-drawer>
</template>

<script setup>
const drawer = reactive({
  visible: false
})

const handleOpen = () => {
  drawer.visible = true
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
