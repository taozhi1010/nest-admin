/**
 * 系统设置管理
 * 管理主题、布局、标签页等个性化配置，支持持久化存储
 */
import { defineStore } from 'pinia'
import defaultSettings from '@/settings'
import { useDynamicTitle } from '@/composables/useDynamicTitle'

const { sideTheme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, dynamicTitle, title: defaultTitle } = defaultSettings

interface LayoutSetting {
  theme?: string
  sideTheme?: string
  topNav?: boolean
  tagsView?: boolean
  fixedHeader?: boolean
  sidebarLogo?: boolean
  dynamicTitle?: boolean
}

interface SettingsState {
  title: string
  theme: string
  sideTheme: string
  showSettings: boolean
  topNav: boolean
  tagsView: boolean
  fixedHeader: boolean
  sidebarLogo: boolean
  dynamicTitle: boolean
}

const storageSetting: LayoutSetting = (() => {
  try {
    return JSON.parse(localStorage.getItem('layout-setting') || '{}')
  } catch {
    return {}
  }
})()

const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    title: defaultTitle || 'nest-admin 后台管理系统',
    theme: storageSetting.theme || '#409EFF',
    sideTheme: storageSetting.sideTheme || sideTheme,
    showSettings: showSettings,
    topNav: storageSetting.topNav === undefined ? topNav : storageSetting.topNav,
    tagsView: storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
    fixedHeader: storageSetting.fixedHeader === undefined ? fixedHeader : storageSetting.fixedHeader,
    sidebarLogo: storageSetting.sidebarLogo === undefined ? sidebarLogo : storageSetting.sidebarLogo,
    dynamicTitle: storageSetting.dynamicTitle === undefined ? dynamicTitle : storageSetting.dynamicTitle
  }),
  actions: {
    // 修改布局设置
    changeSetting(data: { key: keyof SettingsState; value: any }) {
      const { key, value } = data
      if (key in this) {
        this[key] = value
      }
    },
    // 设置网页标题
    setTitle(title: string) {
      this.title = title
      const { updateTitle } = useDynamicTitle()
      updateTitle()
    }
  }
})

export default useSettingsStore
