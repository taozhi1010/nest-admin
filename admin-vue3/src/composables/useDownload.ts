import axios from 'axios'
import { saveAs } from 'file-saver'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { ElMessage } from 'element-plus'
import { isValidBlob } from './useValidator'

// ==================== 工具函数 ====================

/**
 * 处理下载错误信息
 */
async function handleDownloadError(data: Blob): Promise<void> {
  try {
    const resText = await data.text()
    const rspObj = JSON.parse(resText)
    const errMsg = errorCode[rspObj.code as keyof typeof errorCode] || rspObj.msg || errorCode['default']
    ElMessage.error(errMsg)
  } catch (error) {
    console.error('解析下载错误信息失败:', error)
    ElMessage.error('下载文件出现错误')
  }
}

/**
 * 通用的 Blob 下载处理
 */
function handleBlobDownload(
  response: any,
  filename: string,
  blobType?: string
): void {
  const isBlob = isValidBlob(response.data)
  
  if (isBlob) {
    const blob = blobType 
      ? new Blob([response.data], { type: blobType })
      : new Blob([response.data])
    saveAs(blob, filename)
  } else {
    handleDownloadError(response.data)
  }
}

// ==================== Composable ====================

/**
 * 文件下载 Composable
 * @example
 * const { downloadByName, downloadByResource, downloadZip } = useDownload()
 */
export function useDownload() {
  const baseURL = (import.meta as any).env.VITE_APP_BASE_API

  /**
   * 通过文件名下载
   * @param name - 文件名
   * @param isDelete - 下载后是否删除服务器文件，默认 true
   */
  const downloadByName = (name: string, isDelete = true): void => {
    const url = `${baseURL}/common/download?fileName=${encodeURIComponent(name)}&delete=${isDelete}`
    
    axios({
      method: 'get',
      url,
      responseType: 'blob',
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then((res) => {
      const filename = decodeURIComponent(res.headers['download-filename'] || name)
      handleBlobDownload(res, filename)
    }).catch((error) => {
      console.error('文件下载失败:', error)
      ElMessage.error('文件下载失败，请稍后重试')
    })
  }

  /**
   * 通过资源路径下载
   * @param resource - 资源路径
   */
  const downloadByResource = (resource: string): void => {
    const url = `${baseURL}/common/download/resource?resource=${encodeURIComponent(resource)}`
    
    axios({
      method: 'get',
      url,
      responseType: 'blob',
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then((res) => {
      const filename = decodeURIComponent(res.headers['download-filename'] || 'download')
      handleBlobDownload(res, filename)
    }).catch((error) => {
      console.error('资源下载失败:', error)
      ElMessage.error('资源下载失败，请稍后重试')
    })
  }

  /**
   * 下载 ZIP 文件
   * @param url - 下载 URL（相对于 baseURL）
   * @param filename - 保存的文件名
   */
  const downloadZip = (url: string, filename: string): void => {
    const fullUrl = baseURL + url
    
    axios({
      method: 'get',
      url: fullUrl,
      responseType: 'blob',
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then((res) => {
      handleBlobDownload(res, filename, 'application/zip')
    }).catch((error) => {
      console.error('ZIP 下载失败:', error)
      ElMessage.error('ZIP 文件下载失败，请稍后重试')
    })
  }

  return {
    downloadByName,
    downloadByResource,
    downloadZip
  }
}
