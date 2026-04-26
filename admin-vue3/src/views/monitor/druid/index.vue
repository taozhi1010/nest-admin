<template>
  <div>
    <i-frame v-model:src="url" />
  </div>
</template>

<script setup lang="ts">
import iFrame from '@/components/iFrame'

const url = ref(`${import.meta.env.VITE_APP_BASE_API}/druid/login.html`)
</script>
