import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 消息提示 Composable
 * @example
 * const { success, error, warning, info, confirm, alert } = useMessage()
 */
export function useMessage() {
  const message = (msg: string, type = 'info') => {
    ElMessage({
      message: msg,
      type,
      duration: 3000
    })
  }

  const success = (msg: string) => message(msg, 'success')
  const error = (msg: string) => message(msg, 'error')
  const warning = (msg: string) => message(msg, 'warning')
  const info = (msg: string) => message(msg, 'info')

  const confirm = (msg: string, title = '提示') => {
    return ElMessageBox.confirm(msg, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  }

  const alert = (msg: string, title = '提示') => {
    return ElMessageBox.alert(msg, title, {
      confirmButtonText: '确定'
    })
  }

  return {
    message,
    success,
    error,
    warning,
    info,
    confirm,
    alert
  }
}
