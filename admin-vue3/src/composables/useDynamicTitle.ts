import useSettingsStore from '@/store/modules/settings'
import defaultSettings from '@/settings'

/**
 * 动态修改标题 Composable
 * @example
 * const { updateTitle } = useDynamicTitle()
 * updateTitle() // 根据设置更新标题
 */
export function useDynamicTitle() {
  const settingsStore = useSettingsStore()

  /**
   * 更新页面标题（根据 Store 配置）
   */
  const updateTitle = () => {
    if (settingsStore.dynamicTitle) {
      document.title = `${settingsStore.title} - ${defaultSettings.title}`
    } else {
      document.title = defaultSettings.title
    }
  }

  /**
   * 设置自定义页面标题
   * @param customTitle 自定义标题内容
   */
  const setTitle = (customTitle: string) => {
    if (settingsStore.dynamicTitle) {
      document.title = `${customTitle} - ${defaultSettings.title}`
    } else {
      document.title = customTitle
    }
  }

  return {
    updateTitle,
    setTitle
  }
}
