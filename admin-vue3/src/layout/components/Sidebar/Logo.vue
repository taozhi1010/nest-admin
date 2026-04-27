<template>
  <div class="sidebar-logo-container" :class="{ collapse: collapse }" :style="{ backgroundColor: sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" class="sidebar-logo" :src="logo" />
        <h1 class="sidebar-title" :style="{ color: sideTheme === 'theme-dark' ? variables.logoTitleColor : variables.logoLightTitleColor }">{{ title }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" class="sidebar-logo" :src="logo" />
        <h1 class="sidebar-title" :style="{ color: sideTheme === 'theme-dark' ? variables.logoTitleColor : variables.logoLightTitleColor }">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts">
import variables from '@/assets/styles/variables.module.scss'
import logo from '@/assets/logo/logo.png'
import useSettingsStore from '@/store/modules/settings'

const props = defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
})

const title = ref('后台管理系统')
const settingsStore = useSettingsStore()
const sideTheme = computed(() => settingsStore.sideTheme)
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: #2b2f3a;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: inline-flex;
    align-items: center;
    padding: 0 16px;

    & .sidebar-logo {
      width: 28px;
      height: 28px;
      vertical-align: middle;
      margin-right: 10px;
      object-fit: contain;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      padding: 0;
      color: #fff;
      font-weight: 600;
      font-size: 15px;
      line-height: 50px;
      font-family:
        Avenir,
        Helvetica Neue,
        Arial,
        Helvetica,
        sans-serif;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 1px;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
    .sidebar-title {
      display: none;
    }
  }
}
</style>
