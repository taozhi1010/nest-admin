<template>
  <div class="use-request-demo">
    <h2>useRequest Composable 使用示例</h2>
    
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>基本用法</span>
        </div>
      </template>
      
      <el-button @click="testBasicRequest" type="primary">测试基本请求</el-button>
      <el-button @click="testPostRequest" type="success">测试 POST 请求</el-button>
      <el-button @click="testDownload" type="warning">测试文件下载</el-button>
    </el-card>
    
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>自定义配置</span>
        </div>
      </template>
      
      <el-button @click="testNoToken" type="info">无 Token 请求</el-button>
      <el-button @click="testNoRepeatCheck" type="danger">禁用重复检查</el-button>
      <el-button @click="testNoErrorMsg" type="warning">禁用错误提示</el-button>
    </el-card>
    
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>响应结果</span>
        </div>
      </template>
      
      <pre>{{ response }}</pre>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRequest } from '@/composables/useRequest'

// 获取 request 和 download 方法
const { request, download } = useRequest()

// 响应数据
const response = ref(null)

// 测试基本 GET 请求
const testBasicRequest = async () => {
  try {
    const res = await request({
      url: '/system/user/list',
      method: 'get',
      params: {
        pageNum: 1,
        pageSize: 10
      }
    })
    response.value = res
    console.log('GET 请求成功:', res)
  } catch (error) {
    console.error('GET 请求失败:', error)
    response.value = { error: error.message }
  }
}

// 测试 POST 请求
const testPostRequest = async () => {
  try {
    const res = await request({
      url: '/system/user',
      method: 'post',
      data: {
        userName: 'test',
        email: 'test@example.com'
      }
    })
    response.value = res
    console.log('POST 请求成功:', res)
  } catch (error) {
    console.error('POST 请求失败:', error)
    response.value = { error: error.message }
  }
}

// 测试文件下载
const testDownload = () => {
  download(
    '/system/user/export',
    { pageNum: 1, pageSize: 10 },
    '用户列表.xlsx'
  )
  response.value = { message: '开始下载文件...' }
}

// 测试无 Token 请求
const testNoToken = async () => {
  try {
    const res = await request({
      url: '/captchaImage',
      method: 'get',
      headers: {
        isToken: false
      }
    })
    response.value = res
    console.log('无 Token 请求成功:', res)
  } catch (error) {
    console.error('无 Token 请求失败:', error)
    response.value = { error: error.message }
  }
}

// 测试禁用重复检查
const testNoRepeatCheck = async () => {
  try {
    const res = await request({
      url: '/system/user',
      method: 'post',
      headers: {
        repeatSubmit: false
      },
      data: {
        userName: 'test'
      }
    })
    response.value = res
    console.log('禁用重复检查请求成功:', res)
  } catch (error) {
    console.error('禁用重复检查请求失败:', error)
    response.value = { error: error.message }
  }
}

// 测试禁用错误提示
const testNoErrorMsg = async () => {
  try {
    const res = await request({
      url: '/nonexistent/api',
      method: 'get',
      showMsg: false
    })
    response.value = res
    console.log('禁用错误提示请求成功:', res)
  } catch (error) {
    console.error('禁用错误提示请求失败:', error)
    response.value = { error: error.message }
  }
}
</script>

<style scoped>
.use-request-demo {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
}
</style>
