/**
 * Vue Setup 语法糖扩展插件
 * 
 * 功能说明：
 * 1. 扩展 Vue 3 <script setup> 语法
 * 2. 支持 name 属性定义组件名称
 * 3. 提供更好的开发体验
 */
import setupExtend from 'vite-plugin-vue-setup-extend'
import type { PluginOption } from 'vite'

/**
 * 创建 Setup 扩展插件
 * @returns Setup 扩展插件实例
 */
export default function createSetupExtend(): PluginOption {
  return setupExtend()
}
