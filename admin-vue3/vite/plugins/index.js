import vue from '@vitejs/plugin-vue'

import createAutoImport from './auto-import'
import createSvgIcon from './svg-icon'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import { CodeInspectorPlugin } from 'code-inspector-plugin'

export default function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue()]
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createSetupExtend())
  vitePlugins.push(createSvgIcon(isBuild))
  vitePlugins.push(CodeInspectorPlugin({ bundler: 'vite', editor: 'trae' }))
  isBuild && vitePlugins.push(...createCompression(viteEnv))
  return vitePlugins
}
