import type { AxiosRequestConfig } from '@vben/request';

import { requestClient } from '#/api/request';

/**
 * Axios上传进度事件
 */
export type AxiosProgressEvent = AxiosRequestConfig['onUploadProgress'];

/**
 * 通过单文件上传接口
 * @param file 上传的文件
 * @param onUploadProgress 上传进度事件 非必传
 * @returns 上传结果
 */
export function uploadApi(
  file: Blob | File,
  onUploadProgress?: AxiosProgressEvent,
) {
  return requestClient.upload(
    '/resource/oss/upload',
    { file },
    { onUploadProgress, timeout: 60_000 },
  );
}
/**
 * 默认上传结果
 */
export interface UploadResult {
  url: string;
  fileName: string;
  ossId: string;
}
