import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { LicenseService } from './license.service'

@ApiTags('许可证管理')
@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('info')
  @ApiOperation({ summary: '获取许可证信息' })
  async getLicenseInfo() {
    try {
      const licenseInfo = await this.licenseService.getLicenseInfo()
      if (!licenseInfo) {
        return {
          code: 404,
          message: '未找到许可证文件',
          data: null,
        }
      }

      // 计算剩余天数
      const expiryDate = new Date(licenseInfo.expiryDate)
      const currentDate = new Date()
      const remainingDays = Math.ceil(
        (expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      )

      return {
        code: 200,
        message: '获取成功',
        data: {
          productName: licenseInfo.productName,
          clientId: licenseInfo.clientId,
          expiryDate: licenseInfo.expiryDate,
          features: licenseInfo.features,
          remainingDays,
          isValid: remainingDays > 0,
        },
      }
    }
    catch (error) {
      return {
        code: 500,
        message: '获取许可证信息失败',
        data: null,
      }
    }
  }

  @Get('status')
  @ApiOperation({ summary: '验证许可证状态' })
  async validateLicense() {
    try {
      const isValid = await this.licenseService.validateLicense()
      return {
        code: 200,
        message: isValid ? '许可证有效' : '许可证无效',
        data: {
          isValid,
          timestamp: new Date().toISOString(),
        },
      }
    }
    catch (error) {
      return {
        code: 500,
        message: '验证许可证失败',
        data: {
          isValid: false,
          timestamp: new Date().toISOString(),
        },
      }
    }
  }
}
