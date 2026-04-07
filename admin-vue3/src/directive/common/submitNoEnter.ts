/**
 * 禁用 Enter 键提交表单
 * 用于防止表单中只有一个输入框时按 Enter 意外提交
 * 
 * 使用方式：
 * <el-form v-no-enter>
 *   <el-input v-model="form.name" />
 * </el-form>
 */

import type { Directive } from 'vue'

interface NoEnterElement extends HTMLElement {
  _handleKeyDown?: (event: KeyboardEvent) => void
}

const submitNoEnter: Directive<NoEnterElement> = {
  mounted(el) {
    el._handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
      }
    }
    el.addEventListener('keydown', el._handleKeyDown)
  },
  beforeUnmount(el) {
    if (el._handleKeyDown) {
      el.removeEventListener('keydown', el._handleKeyDown)
      delete el._handleKeyDown
    }
  }
}

export default submitNoEnter
