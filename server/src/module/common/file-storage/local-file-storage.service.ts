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
   */
  async uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<UploadResult> {
    // 对文件名转码
    const originalname = iconv.decode(Buffer.from(fileName, 'binary'), 'utf8');
    const ext = Mime.extension(contentType);
    // 重新生成文件名加上时间戳
    const newFileName = this.getNewFileName(originalname) + '.' + ext;
    // 文件路径
    const targetFile = path.join(this.baseDirPath, newFileName);
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
   */
  private getNewFileName(originalname: string): string {
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
    if (!timestampRegex.test(fileName)) {
      fileName = `${fileName}_${new Date().getTime()}`;
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
