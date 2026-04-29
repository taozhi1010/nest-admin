<template>
  <div v-loading="loading" :style="'height:' + height">
    <iframe frameborder="no" scrolling="auto" :src="url" style="width: 100%; height: 100%"></iframe>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const height = ref(`${document.documentElement.clientHeight - 94.5}px;`)
const loading = ref(true)
const url = computed(() => props.src)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
  window.onresize = function temp() {
    height.value = `${document.documentElement.clientHeight - 94.5}px;`
  }
})
</script>
