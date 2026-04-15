<template>
  <section class="app-main">
    <!-- 路由加载状态提示 -->
    <div v-if="routeLoading" class="route-loading-overlay">
      <div class="loading-content">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>页面加载中...</span>
      </div>
    </div>
    
    <router-view v-slot="{ Component, route }">
      <!-- <transition name="fade-transform" mode="out-in"> -->
      <keep-alive :include="tagsViewStore.cachedViews">
        <component :is="Component" v-if="!route.meta.link" :key="route.path" />
      </keep-alive>
      <!-- </transition> -->
    </router-view>
    <iframe-toggle />
  </section>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'
import iframeToggle from './IframeToggle/index'
import useTagsViewStore from '@/store/modules/tagsView'
import { routeLoading } from '@/composables/useRouteLoading'

const tagsViewStore = useTagsViewStore()
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}

// 路由加载状态遮罩层
.route-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #409eff;
    font-size: 14px;
    
    .el-icon {
      font-size: 32px;
    }
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 6px;
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 3px;
}
</style>
