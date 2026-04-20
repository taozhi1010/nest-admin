/**
 * Vite 插件统一入口
 * 
 * 功能说明：
 * 1. 集成所有 Vite 插件配置
 * 2. 根据构建环境动态加载插件
 * 3. 统一管理插件注册顺序
 */
import vue from '@vitejs/plugin-vue'
import type { PluginOption } from 'vite'

import createAutoImport from './auto-import'
import createSvgIcon from './svg-icon'
import createCompression from './compression'
import createSetupExtend from './setup-extend'

interface ViteEnv {
  [key: string]: any
}

/**
 * 创建 Vite 插件集合
 * @param viteEnv - Vite 环境变量
 * @param isBuild - 是否为生产构建
 * @returns Vite 插件数组
 */
export default function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean = false): PluginOption[] {
  // 基础 Vue 插件
  const vitePlugins: PluginOption[] = [vue()]
  
  // 添加自动导入插件
  vitePlugins.push(...createAutoImport())
  
  // 添加 setup 语法糖扩展插件
  vitePlugins.push(createSetupExtend())
  
  // 添加 SVG 图标插件
  vitePlugins.push(createSvgIcon(isBuild))
  
  // 仅在生产构建时添加压缩插件
  if (isBuild) {
    vitePlugins.push(...createCompression(viteEnv))
  }
  
  return vitePlugins
}
