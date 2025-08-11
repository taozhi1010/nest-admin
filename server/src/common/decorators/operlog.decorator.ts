import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common'
import { BusinessType } from '../constant/business.constant'
import { OperlogInterceptor } from '../interceptor/operlog.interceptor'

export type OperlogConfig =
  | Partial<{
    businessType?: (typeof BusinessType)[keyof Omit<typeof BusinessType, 'prototype'>]
  }>
  | undefined

export function Operlog(logConfig?: OperlogConfig) {
  return applyDecorators(SetMetadata('operlog', logConfig), UseInterceptors(OperlogInterceptor))
}
