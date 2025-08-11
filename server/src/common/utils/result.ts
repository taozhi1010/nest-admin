import { HttpException } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export const SUCCESS_CODE = 200

export class BusinessException extends HttpException {
  constructor(code: number, message?: string, data?: any) {
    super({ code, message, data }, 200)
  }
}

/**
 * 响应结构
 * ok 成功
 * fail 失败
 */
export class ResultData<T> {
  constructor(code = SUCCESS_CODE, message?: string, data?: T) {
    this.code = code
    this.message = message || '操作成功'
    this.data = data || null
  }

  @ApiProperty({ type: 'number', default: SUCCESS_CODE })
  code: number

  @ApiProperty({ type: 'string', default: '操作成功' })
  message?: string

  data?: T

  static ok<T>(data?: T, message?: string) {
    return new ResultData(SUCCESS_CODE, message, data)
  }

  static fail<T>(code: number, message?: string, data?: T) {
    return new BusinessException(code || 500, message || 'fail', data)
  }

  static rows<T>(data: { rows: T[], total: number, [key: string]: any }, message?: string) {
    return new ResultData(SUCCESS_CODE, message || '查询成功', data)
  }
}
