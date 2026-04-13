<template>
  <div class="swagger-container">
    <div class="section-header">
      <h3 class="section-title">接口文档</h3>
      <p class="section-desc">多种文档视图，满足不同使用场景</p>
    </div>
    <el-row :gutter="20">
      <el-col :lg="8" :md="12" :sm="24" :xs="24">
        <el-card class="api-doc-card" @click="openApiDoc(swaggerUrl)">
          <div class="doc-card-content">
            <div class="doc-icon primary">
              <el-icon :size="40">
                <Promotion />
              </el-icon>
            </div>
            <div class="doc-info">
              <h4 class="doc-name">Swagger UI</h4>
              <p class="doc-desc">交互式 API 文档，支持在线调试</p>
            </div>
            <div class="doc-action">
              <el-button type="primary" size="small" icon="TopRight">查看</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :md="12" :sm="24" :xs="24">
        <el-card class="api-doc-card" @click="openApiDoc(redocUrl)">
          <div class="doc-card-content">
            <div class="doc-icon success">
              <el-icon :size="40">
                <Document />
              </el-icon>
            </div>
            <div class="doc-info">
              <h4 class="doc-name">Redoc 文档</h4>
              <p class="doc-desc">美观的 API 文档展示，易于阅读</p>
            </div>
            <div class="doc-action">
              <el-button type="success" size="small" icon="TopRight">查看</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :md="12" :sm="24" :xs="24">
        <el-card class="api-doc-card" @click="openApiDoc(apifoxJsonUrl)">
          <div class="doc-card-content">
            <div class="doc-icon warning">
              <el-icon :size="40">
                <Link />
              </el-icon>
            </div>
            <div class="doc-info">
              <h4 class="doc-name">Apifox 导入</h4>
              <p class="doc-desc">OpenAPI 规范文件，支持导入 Apifox</p>
            </div>
            <div class="doc-action">
              <el-button type="warning" size="small" icon="TopRight">查看</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Swagger">
import { ref } from 'vue'
import { Document, Promotion, Link } from '@element-plus/icons-vue'

const activeTab = ref('swagger')
const baseUrl = import.meta.env.VITE_APP_BASE_API
const isDev = import.meta.env.VITE_APP_ENV === 'development'

// 开发环境：直接访问后端地址（8080端口）
// 生产环境：通过后端代理访问
const apiBaseUrl = isDev ? 'http://localhost:8080' : baseUrl

const swaggerUrl = ref(`${apiBaseUrl}/swagger-ui`)
const redocUrl = ref(`${apiBaseUrl}/docs`)
const apifoxJsonUrl = ref(`${apiBaseUrl}/openapi.json`)

function openApiDoc(url) {
  window.open(url, '_blank')
}
</script>

<style lang="scss" scoped>
.swagger-container {
  padding: 20px;

  .section-header {
    text-align: center;
    margin-bottom: 30px;

    .section-title {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 10px 0;
    }

    .section-desc {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .api-doc-card {
    height: 100%;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      border-color: #409eff;
    }

    .doc-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 10px 0;

      .doc-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);

        &.primary {
          color: #409eff;
        }

        &.success {
          color: #67c23a;
        }

        &.warning {
          color: #e6a23c;
        }
      }

      .doc-info {
        flex: 1;

        .doc-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }

        .doc-desc {
          font-size: 13px;
          color: #909399;
          margin: 0;
          line-height: 1.6;
        }
      }

      .doc-action {
        flex-shrink: 0;
      }
    }
  }

  .preview-section {
    margin-top: 20px;

    .swagger-tabs {
      height: calc(100vh - 300px);
      min-height: 600px;

      :deep(.el-tabs__content) {
        height: calc(100% - 56px);
        overflow: hidden;
      }

      :deep(.el-tab-pane) {
        height: 100%;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .swagger-container {
    padding: 10px;

    .api-doc-card {
      .doc-card-content {
        flex-direction: column;
        text-align: center;

        .doc-icon {
          margin: 0 auto;
        }

        .doc-action {
          margin-top: 10px;
        }
      }
    }
  }
}
</style>
