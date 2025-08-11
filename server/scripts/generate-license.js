#!/usr/bin/env node

/**
 * 许可证生成工具
 * 使用方法：
 * ts-node scripts/generate-license.ts [clientId] [expiryDate] [features]
 *
 * 示例：
 * ts-node scripts/generate-license.ts generate "client-001" "2025-12-31" "basic,advanced"
 */

import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import * as path from 'node:path'

class LicenseGenerator {
  secretKey = 'nest-app-2024-secret-key-v1.0'
  algorithm = 'aes-256-cbc'

  /**
   * 生成许可证
   */
  generateLicense(clientId, expiryDate, features = ['basic']) {
    try {
      const licenseData = {
        productName: 'nest-app',
        clientId,
        expiryDate,
        features,
      }

      // 生成签名
      const dataString = JSON.stringify(licenseData, Object.keys(licenseData).sort())
      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(dataString)
        .digest('hex')

      const finalLicenseData = {
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
      console.error('生成许可证失败:', error.message)
      throw error
    }
  }

  /**
   * 获取加密密钥
   */
  getKey() {
    return crypto.scryptSync(this.secretKey, 'salt', 32)
  }

  /**
   * 验证许可证格式
   */
  validateLicenseFormat(licenseContent) {
    try {
      const parts = licenseContent.split(':')
      if (parts.length !== 2) {
        return false
      }

      const iv = Buffer.from(parts[0], 'hex')
      const encryptedContent = Buffer.from(parts[1], 'hex')

      const decipher = crypto.createDecipheriv(this.algorithm, this.getKey(), iv)
      let decrypted = decipher.update(encryptedContent, undefined, 'utf8')
      decrypted += decipher.final('utf8')

      const licenseData = JSON.parse(decrypted)

      return licenseData.productName === 'nest-app'
        && licenseData.clientId
        && licenseData.expiryDate
        && licenseData.signature
    }
    catch (error) {
      return false
    }
  }
}

// 命令行参数处理
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
许可证生成工具使用说明：

生成许可证：
  node scripts/generate-license.js generate <clientId> <expiryDate> [features]
  
验证许可证：
  node scripts/generate-license.js validate <licensePath>

参数说明：
  clientId    - 客户端ID
  expiryDate  - 过期日期 (格式: YYYY-MM-DD)
  features    - 功能列表，用逗号分隔 (可选，默认: basic)
  licensePath - 许可证文件路径

示例：
  node scripts/generate-license.js generate "client-001" "2025-12-31" "basic,advanced"
  node scripts/generate-license.js validate "./nest-app.license"
`)
    return
  }

  const generator = new LicenseGenerator()
  const command = args[0]

  if (command === 'generate') {
    if (args.length < 3) {
      console.error('错误: 缺少必要参数')
      console.log('用法: node scripts/generate-license.js generate <clientId> <expiryDate> [features]')
      process.exit(1)
    }

    const clientId = args[1]
    const expiryDate = args[2]
    const features = args[3] ? args[3].split(',').map(f => f.trim()) : ['basic']

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(expiryDate)) {
      console.error('错误: 日期格式不正确，请使用 YYYY-MM-DD 格式')
      process.exit(1)
    }

    // 验证日期是否有效
    const expiry = new Date(expiryDate)
    if (isNaN(expiry.getTime())) {
      console.error('错误: 无效的日期')
      process.exit(1)
    }

    // // 检查日期是否在未来
    // if (expiry <= new Date()) {
    //   console.error('错误: 过期日期必须是未来的日期')
    //   process.exit(1)
    // }

    try {
      const license = generator.generateLicense(clientId, expiryDate, features)
      const outputPath =  path.posix.join(process.cwd(), 'nest-app.license')

      fs.writeFileSync(outputPath, license)

      console.log('✅ 许可证生成成功!')
      console.log(`📁 文件位置: ${outputPath}`)
      console.log(`👤 客户端ID: ${clientId}`)
      console.log(`📅 过期日期: ${expiryDate}`)
      console.log(`🔧 功能列表: ${features.join(', ')}`)
      console.log(`\n许可证内容:\n${license}`)
    }
    catch (error) {
      console.error('❌ 生成许可证失败:', error.message)
      process.exit(1)
    }
  }
  else if (command === 'validate') {
    if (args.length < 2) {
      console.error('错误: 缺少许可证文件路径')
      console.log('用法: node scripts/generate-license.js validate <licensePath>')
      process.exit(1)
    }

    const licensePath = args[1]

    if (!fs.existsSync(licensePath)) {
      console.error(`❌ 许可证文件不存在: ${licensePath}`)
      process.exit(1)
    }

    try {
      const licenseContent = fs.readFileSync(licensePath, 'utf8')
      const isValid = generator.validateLicenseFormat(licenseContent)

      if (isValid) {
        console.log('✅ 许可证格式有效')
      }
      else {
        console.log('❌ 许可证格式无效')
        process.exit(1)
      }
    }
    catch (error) {
      console.error('❌ 验证许可证失败:', error.message)
      process.exit(1)
    }
  }
  else {
    console.error(`错误: 未知命令 "${command}"`)
    console.log('支持的命令: generate, validate')
    process.exit(1)
  }
}

// 直接运行主函数
main()

export { LicenseGenerator }
