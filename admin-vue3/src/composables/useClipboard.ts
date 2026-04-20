import { ref } from 'vue'

/**
 * 剪贴板操作 Composable
 * @returns 剪贴板操作方法及状态
 */
export function useClipboard() {
  const copied = ref(false)
  const error = ref<string | null>(null)

  /**
   * 复制文本到剪贴板
   * @param text - 要复制的文本
   * @returns Promise<void>
   */
  const copy = async (text: string): Promise<void> => {
    try {
      // 优先使用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // 降级方案：使用传统方法
        await fallbackCopyTextToClipboard(text)
      }
      
      copied.value = true
      error.value = null
      
      // 2秒后重置 copied 状态
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '复制失败'
      throw err
    }
  }

  return {
    copy,
    copied,
    error
  }
}

/**
 * 降级方案：使用传统方法复制文本
 * @param text - 要复制的文本
 * @returns Promise<void>
 */
async function fallbackCopyTextToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = document.createElement('textarea')
    const previouslyFocusedElement = document.activeElement

    element.value = text
    element.setAttribute('readonly', '')
    element.style.position = 'absolute'
    element.style.left = '-9999px'
    element.style.fontSize = '12pt' // 防止 iOS 缩放

    const selection = document.getSelection()
    const originalRange = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null

    document.body.appendChild(element)
    element.select()

    // iOS 选择 workaround
    element.selectionStart = 0
    element.selectionEnd = text.length

    let isSuccess = false
    try {
      isSuccess = document.execCommand('copy')
    } catch (err) {
      reject(new Error('复制命令执行失败'))
      element.remove()
      return
    }

    element.remove()

    if (originalRange && selection) {
      selection.removeAllRanges()
      selection.addRange(originalRange)
    }

    if (previouslyFocusedElement instanceof HTMLElement) {
      previouslyFocusedElement.focus()
    }

    if (isSuccess) {
      resolve()
    } else {
      reject(new Error('复制操作失败'))
    }
  })
}
