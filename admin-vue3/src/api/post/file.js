import request from '@/composables/useRequest';

export function listFile(query) {
  return request({ url: '/common/upload/list', method: 'get', params: query });
}
export function listFileExts() {
  return request({ url: '/common/upload/exts', method: 'get' });
}
export function delFile(ids) {
  return request({ url: `/common/upload/${ids}`, method: 'delete' });
}
