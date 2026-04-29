import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IFileStorage, UploadResult } from './interfaces/file-storage.interface';
import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
import Mime from 'mime-types';

/**
 * 本地文件存储实现
 */
@Injectable()
export class LocalFileStorage implements IFileStorage {
  private baseDirPath: string;
  private serveRoot: string;

  constructor(private configService: ConfigService) {
    const rootPath = process.cwd();
    this.baseDirPath = path.join(rootPath, this.configService.get('app.file.location'));
    this.serveRoot = this.configService.get<string>('app.file.serveRoot', '/profile');
  }

  /**
   * 上传文件到本地
   * @param buffer 文件二进制数据
   * @param fileName 文件名
   * @param contentType 文件 MIME 类型
   * @param customPath 自定义存储路径（必填）
   * @param authorName 作者名称（可选，用于生成文件名）
   */
  async uploadFile(buffer: Buffer, fileName: string, contentType: string, customPath: string, authorName?: string): Promise<UploadResult> {
    // 验证 path 参数
    if (!customPath || !customPath.trim()) {
      throw new Error('文件存储路径不能为空');
    }

    // 处理文件名编码（Multer 已处理大部分情况，这里做二次保障）
    // 支持中文等特殊字符的文件名
    const originalname = iconv.decode(Buffer.from(fileName, 'binary'), 'utf8');
    const ext = Mime.extension(contentType);
    // 重新生成文件名：保留中文原名 + 时间戳 + 作者名，避免重名
    const newFileName = this.getNewFileName(originalname, authorName) + '.' + ext;

    // 清理路径，防止路径遍历攻击
    const safePath = customPath.replace(/\.\./g, '').replace(/^\/+|\/+$/g, '');
    // 构建文件路径
    const targetFile = path.join(this.baseDirPath, safePath, newFileName);

    // 文件目录
    const sourceFilesDir = path.dirname(targetFile);

    if (!fs.existsSync(sourceFilesDir)) {
      this.mkdirsSync(sourceFilesDir);
    }
    fs.writeFileSync(targetFile, buffer);

    // 文件服务完整路径 - 使用正斜杠拼接 URL
    const relativeFilePath = targetFile.replace(this.baseDirPath, '').replace(/\\/g, '/');
    const fileNamePath = this.serveRoot + relativeFilePath;

    // 构建 URL（只返回相对路径，前端会自动拼接域名）
    const url = fileNamePath;

    return {
      fileName: fileNamePath,
      newFileName: newFileName,
      url: url,
    };
  }

  /**
   * 删除本地文件
   */
  async deleteFile(fileName: string): Promise<void> {
    const targetFile = path.join(this.baseDirPath, fileName);
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(fileName: string): Promise<boolean> {
    const targetFile = path.join(this.baseDirPath, fileName);
    return fs.existsSync(targetFile);
  }

  /**
   * 生成新的文件名
   * @param originalname 原始文件名
   * @param authorName 作者名称（可选）
   * @returns 带时间戳和作者名的新文件名
   */
  private getNewFileName(originalname: string, authorName?: string): string {
    if (!originalname) {
      return originalname;
    }
    // 只取文件名部分，不包含扩展名
    const nameParts = originalname.split('.');
    if (nameParts.length > 1) {
      nameParts.pop(); // 移除扩展名
    }
    let fileName = nameParts.join('.');

    // 检查文件名是否已经包含时间戳
    const timestampRegex = /_\d{13}$/;

    // 构建新文件名：原名_时间戳_作者名
    const timestamp = new Date().getTime();
    if (authorName) {
      // 清理作者名中的特殊字符，只保留字母、数字、中文、下划线
      const safeAuthorName = authorName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_]/g, '_');
      if (!timestampRegex.test(fileName)) {
        fileName = `${fileName}_${timestamp}_${safeAuthorName}`;
      } else {
        // 如果已有时间戳，在时间戳后添加作者名
        fileName = fileName.replace(/(\d{13})$/, `$1_${safeAuthorName}`);
      }
    } else {
      // 没有作者名，只添加时间戳
      if (!timestampRegex.test(fileName)) {
        fileName = `${fileName}_${timestamp}`;
      }
    }

    return fileName;
  }

  /**
   * 递归创建目录 同步方法
   */
  private mkdirsSync(dirname: string): boolean {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      if (this.mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
  }
}
