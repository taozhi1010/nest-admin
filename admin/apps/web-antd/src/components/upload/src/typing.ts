import type { Recordable } from '@vben/types';

export enum UploadResultStatus {
  DONE = 'done',
  ERROR = 'error',
  SUCCESS = 'success',
  UPLOADING = 'uploading',
}

export interface FileItem {
  thumbUrl?: string;
  name: string;
  size: number | string;
  type?: string;
  percent: number;
  file: File;
  status?: UploadResultStatus;
  response?: Recordable<any> | { fileName: string; ossId: string; url: string };
  uuid: string;
}

export interface Wrapper {
  record: FileItem;
  uidKey: string;
  valueKey: string;
}

export interface BaseFileItem {
  uid: number | string;
  url: string;
  name?: string;
}
export interface PreviewFileItem {
  url: string;
  name: string;
  type: string;
}
