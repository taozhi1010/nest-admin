<template>
  <div class="swagger-container">
    <el-tabs v-model="activeTab" class="swagger-tabs" type="border-card">
      <el-tab-pane label="Swagger UI" name="swagger">
        <i-frame v-model:src="swaggerUrl" />
      </el-tab-pane>
      <el-tab-pane label="Redoc 文档" name="redoc">
        <i-frame v-model:src="redocUrl" />
      </el-tab-pane>
      <el-tab-pane label="Apifox 导入" name="apifox">
        <div class="apifox-container">
          <el-alert class="apifox-alert" :closable="false" show-icon title="Apifox 导入说明" type="info">
            <template #title>
              <div class="apifox-content">
                <span class="apifox-text">点击下方链接导入 Apifox：</span>
                <a class="apifox-link" :href="apifoxJsonUrl" target="_blank">
                  {{ apifoxJsonUrl }}
                  <el-icon>
                    <link />
                  </el-icon>
                </a>
              </div>
            </template>
          </el-alert>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="Swagger">
import { ref } from 'vue'
import iFrame from '@/components/iFrame'
import { Link } from '@element-plus/icons-vue'

const activeTab = ref('swagger')
const baseUrl = import.meta.env.VITE_APP_BASE_API

const swaggerUrl = ref(`${baseUrl}swagger-ui`)
const redocUrl = ref(`${baseUrl}docs`)
const apifoxJsonUrl = ref(`${baseUrl}openapi.json`)
</script>

<style lang="scss" scoped>
.swagger-container {
  padding: 0;
  height: calc(100vh - 134px);

  .swagger-tabs {
    height: 100%;

    :deep(.el-tabs__content) {
      height: calc(100% - 56px);
      overflow: hidden;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }
}

.apifox-container {
  padding: 20px;

  .apifox-alert {
    width: 100%;
    max-width: 800px;

    :deep(.el-alert__content) {
      display: block;
    }

    :deep(.el-alert__title) {
      font-size: 14px;
    }
  }

  .apifox-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: nowrap;
  }

  .apifox-text {
    margin: 0;
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .apifox-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #409eff;
    text-decoration: none;
    padding: 8px 16px;
    background: #f5f7fa;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    font-size: 14px;
    transition: all 0.3s;
    width: fit-content;
    flex-shrink: 0;

    &:hover {
      background: #ecf5ff;
      color: #66b1ff;
      border-color: #c6e2ff;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
    }

    .el-icon {
      font-size: 16px;
    }
  }
}
</style>
