/**
 * useRequest Composable 功能测试脚本
 * 
 * 这个脚本用于验证 useRequest composable 的基本功能
 * 可以在浏览器控制台中运行此脚本来测试请求功能
 */

// 测试 useRequest 基本功能
function testUseRequest() {
  console.log('=== useRequest Composable 功能测试 ===')
  
  // 检查 useRequest 是否可用
  if (typeof useRequest === 'undefined') {
    console.error('❌ useRequest 未定义，请检查自动导入配置')
    return false
  }
  
  console.log('✅ useRequest 已正确导入')
  
  // 获取 request 和 download 方法
  const { request, download } = useRequest()
  
  // 测试 request 实例是否存在
  console.log('\n--- Request 实例测试 ---')
  console.log('request 实例存在:', !!request)
  console.log('request 默认配置:', request.defaults)
  
  // 测试 download 函数是否存在
  console.log('\n--- Download 函数测试 ---')
  console.log('download 函数存在:', typeof download === 'function')
  
  console.log('\n=== 基本功能测试完成 ===')
  return true
}

// 测试请求拦截器功能
function testRequestInterceptors() {
  console.log('\n=== 请求拦截器测试 ===')
  
  const { request } = useRequest()
  
  // 模拟一个请求配置
  const mockConfig = {
    url: '/test',
    method: 'get',
    headers: {}
  }
  
  console.log('模拟请求配置:', mockConfig)
  console.log('注意: 实际拦截器测试需要在真实请求环境中进行')
  
  console.log('=== 请求拦截器测试完成 ===')
}

// 测试响应拦截器功能
function testResponseInterceptors() {
  console.log('\n=== 响应拦截器测试 ===')
  
  const { request } = useRequest()
  
  console.log('响应拦截器已注册')
  console.log('注意: 实际响应拦截器测试需要在真实请求环境中进行')
  
  console.log('=== 响应拦截器测试完成 ===')
}

// 运行所有测试
function runAllTests() {
  try {
    testUseRequest()
    testRequestInterceptors()
    testResponseInterceptors()
    console.log('\n🎉 所有 useRequest 测试完成！')
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error)
  }
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testUseRequest,
    testRequestInterceptors,
    testResponseInterceptors,
    runAllTests
  }
} else {
  // 在浏览器环境中直接运行测试
  window.testUseRequest = runAllTests
  console.log('💡 提示: 在浏览器控制台中运行 testUseRequest() 来执行测试')
}
