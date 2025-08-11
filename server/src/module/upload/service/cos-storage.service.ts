import path from 'node:path'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import COS from 'cos-nodejs-sdk-v5'
import { IStorageService } from '../interface/storage.interface'

@Injectable()
export class CosStorageService implements IStorageService {
  private cos: COS

  constructor(private config: ConfigService) {
    this.cos = new COS({
      SecretId: this.config.get('cos.secretId'),
      SecretKey: this.config.get('cos.secretKey'),
      FileParallelLimit: 3,
      ChunkParallelLimit: 8,
      ChunkSize: 1024 * 1024 * 8,
    })
  }

  async saveFile(targetPath: string, newFileName: string, file: Express.Multer.File) {
    const targetDir = this.config.get('cos.location')
    const targetFile = path.join(targetDir, targetPath, newFileName)

    await this.cos.putObject({
      Bucket: this.config.get('cos.bucket'),
      Region: this.config.get('cos.region'),
      Key: targetFile.replace(/\\/g, '/'),
      Body: file.buffer,
    })

    const url = path.join(this.config.get('cos.domain'), targetFile)
    return {
      fileName: targetFile,
      url,
    }
  }

  async checkExists(targetFile: string): Promise<boolean> {
    try {
      const result = await this.cos.headObject({
        Bucket: this.config.get('cos.bucket'),
        Region: this.config.get('cos.region'),
        Key: targetFile,
      })
      return result.statusCode === 200
    }
    catch {
      return false
    }
  }

  async deleteFile(targetFile: string): Promise<void> {
    if (await this.checkExists(targetFile)) {
      await this.cos.deleteObject({
        Bucket: this.config.get('cos.bucket'),
        Region: this.config.get('cos.region'),
        Key: targetFile,
      })
    }
  }

  async uploadChunk(chunkPath: string, file: Express.Multer.File) {
    if (await this.checkExists(chunkPath)) {
      return
    }

    await this.cos.putObject({
      Bucket: this.config.get('cos.bucket'),
      Region: this.config.get('cos.region'),
      Key: chunkPath,
      Body: file.buffer,
    })
  }

  async mergeChunks(sourceDir: string, targetFile: string, uploadId: string) {
    const objects = await this.cos.getBucket({
      Bucket: this.config.get('cos.bucket'),
      Region: this.config.get('cos.region'),
      Prefix: sourceDir,
    })

    const fileList = objects.Contents.sort(
      (a, b) => Number.parseInt(a.Key.split('@')[1]) - Number.parseInt(b.Key.split('@')[1]),
    )

    await this.cos.uploadPartCopy({
      Bucket: this.config.get('cos.bucket'),
      Region: this.config.get('cos.region'),
      Key: targetFile,
      CopySource: fileList.map(file => file.Key).join(','),
      UploadId: uploadId,
      PartNumber: 1,
    })

    // 删除分片
    await Promise.all(fileList.map(file => this.deleteFile(file.Key)))
  }

  async uploadLargeFile(sourceFile: string, targetFile: string) {
    const key = path.join('test', targetFile)

    await this.cos.uploadFile({
      Bucket: this.config.get('cos.bucket'),
      Region: this.config.get('cos.region'),
      Key: key,
      FilePath: sourceFile,
      SliceSize: 1024 * 1024 * 5,
    })

    const url = path.join(this.config.get('cos.domain'), key)
    return { fileName: key, url }
  }
}
