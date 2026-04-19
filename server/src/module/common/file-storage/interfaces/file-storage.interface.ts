/**
 * 文件存储统一接口
 * 所有存储驱动都需要实现这个接口
 */
export interface UploadResult {
  fileName: string; // 原始文件名
  newFileName: string; // 新文件名
  url: string; // 文件访问路径
}

export interface IFileStorage {
  /**
   * 初始化存储（如创建桶、检查目录等）
   */
  initialize?(): Promise<void>;

  /**
   * 上传文件
   * @param buffer 文件二进制数据
   * @param fileName 文件名
   * @param contentType 文件 MIME 类型
   * @param path 文件存储路径（必填）
   * @param authorName 作者名称（可选，用于生成文件名）
   * @returns 上传结果
   */
  uploadFile(buffer: Buffer, fileName: string, contentType: string, path: string, authorName?: string): Promise<UploadResult>;

  /**
   * 删除文件
   * @param fileName 文件名
   */
  deleteFile(fileName: string): Promise<void>;

  /**
   * 检查文件是否存在
   * @param fileName 文件名
   * @returns 是否存在
   */
  fileExists?(fileName: string): Promise<boolean>;

  /**
   * 获取文件访问 URL
   * @param fileName 文件名
   * @returns 文件访问 URL
   */
  getFileUrl?(fileName: string): Promise<string>;
}
