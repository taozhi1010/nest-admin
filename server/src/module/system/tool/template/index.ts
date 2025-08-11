import * as fs from 'node:fs'
import * as path from 'node:path'
import { glob } from 'glob'
import { GenConstants } from 'src/common/constant/gen.constant'
import velocityjs from 'velocityjs'

const rootPath = path.posix.join(process.cwd(), 'src/module/system/tool/template')
const previewRootPath = path.posix.join(process.cwd(), 'src/module/system/tool/template')

// 匹配所有换行符到#之间的内容，并且替换为空，兼容crlf和lf
function replaceSpace(content: string) {
  return content.replace(/\r?\n\s*#/g, '\n#')
}

// 传入：xx{aa}x{c} 和 { aa: 'bb', c: 1 } 返回 xxbbx1
function replaceStr(content: string, options: { [key: string]: string }) {
  return content.replace(/\{([^}]+)\}/g, (match, key) => {
    return options[key] || match
  })
}

function ignoreField(field: string) {
  return ['delFlag', 'createBy', 'createTime', 'updateBy', 'updateTime'].includes(field)
}

function getValidatorDecorator(javaType: string) {
  if (javaType === 'Boolean')
    return `@IsBoolean()`
  if (javaType === 'String')
    return `@IsString()`
  if (javaType === 'Date')
    return `@IsDate()`
  if (javaType === 'Number')
    return `@IsNumber()`
  if ([`Long`, `Integer`, `Double`, `Float`, `BigDecimal`].includes(javaType))
    return `@IsNumber()`
  return ``
}

function getTsType(javaType: string) {
  if (javaType === 'Boolean')
    return `boolean`
  if (javaType === 'String')
    return `string`
  if (javaType === 'Date')
    return `Date`
  if (javaType === 'Number')
    return `number`
  if ([`Long`, `Integer`, `Double`, `Float`, `BigDecimal`].includes(javaType))
    return `number`
  return `any`
}

function getUiTsType(javaType: string) {
  if (javaType === 'Boolean')
    return `boolean`
  if (javaType === 'String' || javaType === 'Date')
    return `string`
  if (javaType === 'Number')
    return `number`
  if ([`Long`, `Integer`, `Double`, `Float`, `BigDecimal`].includes(javaType))
    return `number`
  return `any`
}

function getBigintType(ColumnType) {
  if (ColumnType === 'bigint')
    return 'string'
  return 'number'
}

function getBool(str) {
  console.log(str)
  return str === '1' ? 'true' : 'false'
}

function convertToSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '')
}

const templateList = glob.sync('./**/*.*.vm').map((file) => {
  // 减去rootPath部分的路径
  const relativePath = path.relative(rootPath, file)
  const name = relativePath.replace('.vm', '').replace(/\\/g, '/')
  // 1234
  // 减去rootPath部分的路径
  const previewRelativePath = path.relative(previewRootPath, file)
  const previewName = previewRelativePath.replace(/\\/g, '/')

  return [name, previewName, replaceSpace(fs.readFileSync(file, 'utf-8'))]
})

export function gen(options) {
  const result: {
    [name: string]: string
  } = {}

  for (const [name, _previewName, content] of templateList) {
    result[replaceStr(name, options)] = velocityjs.render(content, {
      GenConstants,
      getValidatorDecorator,
      getUiTsType,
      getBigintType,
      ignoreField,
      getTsType,
      getBool,
      convertToSnakeCase,
      ...options,
    })
  }
  return result
}

export function previewGen(options) {
  const result: {
    [name: string]: string
  } = {}
  for (const [_name, previewName, content] of templateList) {
    result[replaceStr(previewName, options)] = velocityjs.render(content, {
      GenConstants,
      getValidatorDecorator,
      getUiTsType,
      getBigintType,
      ignoreField,
      getTsType,
      getBool,
      convertToSnakeCase,
      ...options,
    })
  }
  return result
}
