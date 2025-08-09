<template>
  <iframe :src="url" ref="frameRef"></iframe>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAppConfig } from '@vben/hooks';

defineOptions({ name: 'Swagger' });

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
const url = ref<string>(apiURL + '/swagger-ui');
</script>

<style scoped>
iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
