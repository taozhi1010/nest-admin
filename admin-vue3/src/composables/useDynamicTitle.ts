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
   * 更新页面标题
   */
  const updateTitle = () => {
    if (settingsStore.dynamicTitle) {
      document.title = `${settingsStore.title} - ${defaultSettings.title}`
    } else {
      document.title = defaultSettings.title
    }
  }

  return {
    updateTitle
  }
}
