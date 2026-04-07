// 测试 cat-tools 库的引入和使用 (CommonJS 版本)
const { catTools } = require('cat-tools')

console.log('cat-tools 库已成功引入')
console.log('可用的工具函数:', Object.keys(catTools))

// 测试几个常用函数
console.log('isNullorUndefined(null):', catTools.isNullorUndefined(null))
console.log('isNullorUndefined(undefined):', catTools.isNullorUndefined(undefined))
console.log('isNullorUndefined("test"):', catTools.isNullorUndefined('test'))

console.log('deepCopy test:', catTools.deepCopy({ a: 1, b: { c: 2 } }))

// console.log('formatTime test:', catTools.formatTime(new Date())) // 需要特定格式参数

console.log('isNumber test:')
console.log('  isNumber(123):', catTools.isNumber(123))
console.log('  isNumber("123"):', catTools.isNumber('123'))
console.log('  isNumber(NaN):', catTools.isNumber(NaN))

console.log('uniqueArr test:', catTools.uniqueArr([1, 2, 2, 3, 3, 4]))

console.log('cat-tools 测试完成')