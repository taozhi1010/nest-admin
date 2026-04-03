<template>
  <transition-group mode="out-in" name="fade-transform">
    <inner-link v-for="(item, index) in tagsViewStore.iframeViews" v-show="route.path === item.path" :key="item.path" :iframe-id="'iframe' + index" :src="item.meta.link" />
  </transition-group>
</template>

<script setup>
import InnerLink from '../InnerLink/index'
import useTagsViewStore from '@/store/modules/tagsView'

const route = useRoute()
const tagsViewStore = useTagsViewStore()
</script>
