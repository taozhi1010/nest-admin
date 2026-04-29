<template>
  <!-- Element Plus 图标模式 -->
  <component
    v-if="isElementIcon"
    :is="elementIconComponent"
    :class="svgClass"
    :style="iconStyle"
  />
  
  <!-- SVG 图标模式（兼容旧代码） -->
  <svg v-else aria-hidden="true" :class="svgClass">
    <use :fill="color" :xlink:href="iconName" />
  </svg>
</template>

<script setup lang="ts">
import {
  User,
  Lock,
  Key,
  Setting,
  FullScreen,
  CloseBold,
  Phone,
  Message,
  FolderOpened,
  UserFilled,
  Calendar,
  Odometer,
  WarningFilled
} from '@element-plus/icons-vue'

// SVG 图标到 Element Plus 图标的映射表
const iconMap: Record<string, any> = {
  user: User,
  password: Lock,
  validCode: Key,
  size: Setting, // 使用 Setting 齿轮图标表示布局大小
  fullscreen: FullScreen,
  'exit-fullscreen': CloseBold,
  phone: Phone,
  email: Message,
  tree: FolderOpened,
  peoples: UserFilled,
  date: Calendar,
  dashboard: Odometer,
  error: WarningFilled
}

interface Props {
  iconClass: string
  className?: string
  color?: string
  size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  color: '',
  size: ''
})

// 判断是否为 Element Plus 图标
const isElementIcon = computed(() => !!iconMap[props.iconClass])

// 获取 Element Plus 图标组件
const elementIconComponent = computed(() => iconMap[props.iconClass])

// SVG 图标名称
const iconName = computed(() => `#icon-${props.iconClass}`)

// 样式类
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`
  }
  return 'svg-icon'
})

// 图标样式（支持自定义大小）
const iconStyle = computed(() => {
  if (props.size) {
    return {
      fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size
    }
  }
  return {}
})
</script>

<style lang="scss" scoped>
.sub-el-icon,
.nav-icon {
  display: inline-block;
  font-size: 15px;
  margin-right: 12px;
  position: relative;
}

.svg-icon {
  width: 1em;
  height: 1em;
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
  display: inline-block;
  
  // Element Plus 图标样式
  :deep(svg) {
    width: 1em;
    height: 1em;
  }
}
</style>
