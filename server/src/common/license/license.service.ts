import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface LicenseData {
  productName: string
  clientId: string
  expiryDate: string
  features: string[]
  signature: string
}

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name)
  private readonly licenseFilePath: string
  private readonly secretKey: string = 'nest-app-2024-secret-key-v1.0'
  private readonly algorithm: string = 'aes-256-cbc'

  constructor(private configService: ConfigService) {
    this.licenseFilePath = path.posix.join(process.cwd(), 'nest-app.license')
  }

  /**
   * 验证许可证
   */
  async validateLicense(): Promise<boolean> {
    try {
      // 检查许可证文件是否存在
      if (!fs.existsSync(this.licenseFilePath)) {
        this.logger.error('许可证文件不存在: nest-app.license')
        return false
      }

      // 读取许可证文件
      const licenseContent = fs.readFileSync(this.licenseFilePath, 'utf8')

      // 解密许可证内容
      const decryptedData = this.decryptLicense(licenseContent)
      if (!decryptedData) {
        this.logger.error('许可证解密失败')
        return false
      }

      // 解析许可证数据
      const licenseData: LicenseData = JSON.parse(decryptedData)

      // 验证签名
      if (!this.verifySignature(licenseData)) {
        this.logger.error('许可证签名验证失败')
        return false
      }

      // 验证过期时间
      const expiryDate = new Date(licenseData.expiryDate)
      const currentDate = new Date()

      if (currentDate > expiryDate) {
        this.logger.error(`许可证已过期: ${licenseData.expiryDate}`)
        return false
      }

      // 验证产品信息
      if (licenseData.productName !== 'nest-app') {
        this.logger.error('许可证产品名称不匹配')
        return false
      }

      this.logger.log(`许可证验证成功，有效期至: ${licenseData.expiryDate}`)
      return true
    }
    catch (error) {
      this.logger.error('许可证验证过程中发生错误:', error.message)
      return false
    }
  }

  /**
   * 解密许可证
   */
  private decryptLicense(encryptedData: string): string | null {
    try {
      // 解析加密数据 (iv:encryptedContent)
      const parts = encryptedData.split(':')
      if (parts.length !== 2) {
        throw new Error('许可证格式错误')
      }

      const iv = Buffer.from(parts[0], 'hex')
      const encryptedContent = Buffer.from(parts[1], 'hex')

      // 创建解密器
      const decipher = crypto.createDecipheriv(this.algorithm, this.getKey(), iv)

      // 解密
      let decrypted = decipher.update(encryptedContent, undefined, 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    }
    catch (error) {
      this.logger.error('解密失败:', error.message)
      return null
    }
  }

  /**
   * 验证签名
   */
  private verifySignature(licenseData: LicenseData): boolean {
    try {
      const { signature, ...dataToVerify } = licenseData
      const dataString = JSON.stringify(dataToVerify, Object.keys(dataToVerify).sort())
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(dataString)
        .digest('hex')

      return signature === expectedSignature
    }
    catch (error) {
      this.logger.error('签名验证失败:', error.message)
      return false
    }
  }

  /**
   * 获取加密密钥
   */
  private getKey(): Buffer {
    return crypto.scryptSync(this.secretKey, 'salt', 32)
  }

  /**
   * 生成许可证（用于生成工具）
   */
  generateLicense(clientId: string, expiryDate: string, features: string[] = ['basic']): string {
    try {
      const licenseData = {
        productName: 'nest-app',
        clientId,
        expiryDate,
        features,
      }

      // 生成签名
      const dataString = JSON.stringify(licenseData, Object.keys(licenseData).sort())
      const signature = crypto.createHmac('sha256', this.secretKey).update(dataString).digest('hex')

      const finalLicenseData: LicenseData = {
        ...licenseData,
        signature,
      }

      // 加密许可证数据
      const licenseJson = JSON.stringify(finalLicenseData)
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv(this.algorithm, this.getKey(), iv)

      let encrypted = cipher.update(licenseJson, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      // 返回格式: iv:encryptedContent
      return `${iv.toString('hex')}:${encrypted}`
    }
    catch (error) {
      this.logger.error('生成许可证失败:', error.message)
      throw error
    }
  }

  /**
   * 获取许可证信息（如果有效）
   */
  async getLicenseInfo(): Promise<LicenseData | null> {
    try {
      if (!fs.existsSync(this.licenseFilePath)) {
        return null
      }

      const licenseContent = fs.readFileSync(this.licenseFilePath, 'utf8')
      const decryptedData = this.decryptLicense(licenseContent)

      if (!decryptedData) {
        return null
      }

      return JSON.parse(decryptedData)
    }
    catch (error) {
      this.logger.error('获取许可证信息失败:', error.message)
      return null
    }
  }
}
