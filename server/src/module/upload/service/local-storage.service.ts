import fs from 'node:fs'
import path from 'node:path'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IStorageService } from '../interface/storage.interface'

@Injectable()
export class LocalStorageService implements IStorageService {
  constructor(private config: ConfigService) {}

  async saveFile(targetPath: string, newFileName: string, file: Express.Multer.File) {
    const rootPath = process.cwd()
    const baseDirPath = path.join(rootPath, this.config.get('extends.file.location'))
    const targetFile = path.join(baseDirPath, targetPath, newFileName)
    const sourceFilesDir = path.dirname(targetFile)
    const relativeFilePath = targetFile.replace(baseDirPath, '')

    if (!fs.existsSync(sourceFilesDir)) {
      this.mkdirsSync(sourceFilesDir)
    }
    fs.writeFileSync(targetFile, file.buffer)
    const url = `${this.config.get('extends.file.domain')}${path.join(this.config.get('extends.file.serveRoot'), relativeFilePath)}`

    return { fileName: relativeFilePath, url }
  }

  async checkExists(targetFile: string): Promise<boolean> {
    return fs.existsSync(targetFile)
  }

  async deleteFile(targetFile: string): Promise<void> {
    const rootPath = process.cwd()
    targetFile = path.join(rootPath, this.config.get('extends.file.location'), targetFile)
    console.log(targetFile)
    if (await this.checkExists(targetFile)) {
      fs.unlinkSync(targetFile)
    }
  }

  private mkdirsSync(dirname: string) {
    if (fs.existsSync(dirname)) {
      return true
    }
    else {
      if (this.mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname)
        return true
      }
    }
  }

  async uploadChunk(chunkPath: string, file: Express.Multer.File) {
    if (fs.existsSync(chunkPath)) {
      return
    }
    fs.writeFileSync(chunkPath, file.buffer)
  }

  async mergeChunks(sourceDir: string, targetFile: string, uploadId: string) {
    const fileList = fs
      .readdirSync(sourceDir)
      .filter(file => fs.lstatSync(path.join(sourceDir, file)).isFile())
      .sort((a, b) => Number.parseInt(a.split('@')[1]) - Number.parseInt(b.split('@')[1]))
      .map(name => ({
        name,
        filePath: path.join(sourceDir, name),
      }))

    const fileWriteStream = fs.createWriteStream(targetFile)

    for (const { filePath } of fileList) {
      const chunkBuffer = fs.readFileSync(filePath)
      fileWriteStream.write(chunkBuffer)
    }

    fileWriteStream.end()
    fs.rmdirSync(sourceDir, { recursive: true })
  }

  async uploadLargeFile(sourceFile: string, targetFile: string) {
    const rootPath = process.cwd()
    const baseDirPath = path.join(rootPath, this.config.get('extends.file.location'))
    const relativeFilePath = sourceFile.replace(baseDirPath, '')

    const fileName = path.join(this.config.get('extends.file.serveRoot'), relativeFilePath)
    const url = path.join(this.config.get('extends.file.domain'), fileName)

    return { fileName, url }
  }
}
