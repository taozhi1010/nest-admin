<script lang="ts" setup>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

defineProps<{ data: any }>();
</script>

<template>
  <VueJsonPretty :data="data" :deep="3" :show-length="true" path="res" />
</template>

<style>
html[class='dark'] {
  .vjs-tree-node:hover {
    background-color: #333;
  }
}
</style>
