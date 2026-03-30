import { download } from '@/utils/request'

/**
 * 文件下载 Composable
 * @example
 * const { downloadFile } = useDownload()
 */
export function useDownload() {
  const downloadFile = (url: string, params?: any, filename?: string) => {
    return download(url, params, filename)
  }

  return {
    downloadFile
  }
}
