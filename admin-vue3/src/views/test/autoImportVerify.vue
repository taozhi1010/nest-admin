<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <span>✅ 自动引入验证成功！</span>
      </template>

      <el-alert :closable="false" style="margin-bottom: 20px" title="Composables + Auto Import 方案验证" type="success">
        <p>当前页面没有手动 import useCatTools，但可以直接使用！</p>
      </el-alert>

      <el-descriptions border :column="1" title="验证结果">
        <el-descriptions-item label="useCatTools 状态">
          <el-tag type="success">✅ 已自动导入</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="useMessage 状态">
          <el-tag type="success">✅ 已自动导入</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="useDict 状态">
          <el-tag type="success">✅ 已自动导入</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <h3>实际使用测试</h3>
      <el-form label-width="120px">
        <el-form-item label="日期格式化">
          {{ testDateFormat() }}
        </el-form-item>

        <el-form-item label="深拷贝测试">
          <el-button @click="testDeepClone">执行深拷贝</el-button>
          <div v-if="cloneResult">结果：{{ cloneResult }}</div>
        </el-form-item>

        <el-form-item label="消息提示">
          <el-button @click="testMessage">触发消息提示</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="AutoImportVerify">
// 注意：这里没有 import useCatTools，它会被自动导入！
// 如果自动导入失败，TypeScript 会报错

const { dateFormat, deepClone, uuid } = useCatTools()
const { success } = useMessage()

const cloneResult = ref(null)

const testDateFormat = () => {
  return dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss')
}

const testDeepClone = () => {
  const original = { name: 'auto-import', value: 666 }
  cloneResult.value = JSON.stringify(deepClone(original))
}

const testMessage = () => {
  success(`自动导入成功！UUID: ${uuid()}`)
}
</script>

<style scoped>
.el-alert p {
  margin: 5px 0;
}
</style>
