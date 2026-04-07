<template>
  <div class="app-container home">
    <!-- 项目介绍区域 -->
    <el-row :gutter="20" class="intro-section">
      <el-col :lg="12" :sm="24">
        <div class="project-info">
          <h2 class="project-title">nest-admin后台管理框架</h2>
          <p class="project-desc">
            nest-admin管理系统基于Ruoyi框架使用nestjs实现，她可以用于所有的Web应用程序，如网站管理后台，网站会员中心，CMS，CRM，OA等等，当然，您也可以对她进行深度定制，以做出更强系统。所有前端后台代码封装过后十分精简易上手，出错概率低。系统会陆续更新一些实用功能。
          </p>
          <div class="version-info">
            <span class="version-label">当前版本:</span>
            <span class="version-number">v{{ version }}</span>
            <el-tag type="danger" class="free-tag">免费开源</el-tag>
          </div>
          <div class="action-buttons">
            <el-button icon="MostlyCloudy" type="primary" @click="goTarget('https://gitee.com/tao-zhi/nest-admin')">
              访问码云
            </el-button>
            <el-button icon="HomeFilled" @click="goTarget('https://nest-admin.dooring.vip/prod-api/swagger-ui')">
              访问文档
            </el-button>
          </div>
        </div>
      </el-col>

      <el-col :lg="12" :sm="24">
        <div class="tech-stack">
          <h3 class="section-title">技术选型</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="tech-card backend-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><Monitor /></el-icon>
                    <span>后端技术</span>
                  </div>
                </template>
                <div class="tech-list">
                  <div class="tech-item" v-for="tech in backendTechs" :key="tech.name">
                    <el-tag :type="tech.type" effect="plain">{{ tech.name }}</el-tag>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="tech-card frontend-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><Monitor /></el-icon>
                    <span>前端技术</span>
                  </div>
                </template>
                <div class="tech-list">
                  <div class="tech-item" v-for="tech in frontendTechs" :key="tech.name">
                    <el-tag :type="tech.type" effect="plain">{{ tech.name }}</el-tag>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>

    <el-divider />

    <!-- 接口文档区域 -->
    <el-row :gutter="20" class="api-doc-section">
      <el-col :span="24">
        <div class="section-header">
          <h3 class="section-title">接口文档</h3>
          <p class="section-desc">多种文档视图，满足不同使用场景</p>
        </div>
        <el-row :gutter="20">
          <el-col :lg="8" :md="12" :sm="24" :xs="24" v-for="doc in apiDocs" :key="doc.name">
            <el-card class="api-doc-card" @click="openApiDoc(doc.url)">
              <div class="doc-card-content">
                <div class="doc-icon">
                  <el-icon :size="40">
                    <component :is="doc.icon" />
                  </el-icon>
                </div>
                <div class="doc-info">
                  <h4 class="doc-name">{{ doc.name }}</h4>
                  <p class="doc-desc">{{ doc.description }}</p>
                </div>
                <div class="doc-action">
                  <el-button :type="doc.type" size="small" icon="TopRight">查看</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <el-divider />

    <!-- 联系信息和更多产品 -->
    <el-row :gutter="20" class="info-section">
      <el-col :lg="8" :md="12" :sm="24" :xs="24">
        <el-card class="contact-card">
          <template #header>
            <div class="card-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>联系信息</span>
            </div>
          </template>
          <div class="contact-info">
            <div class="contact-item">
              <el-icon><Guide /></el-icon>
              <span>官网：</span>
              <el-link href="https://nest-admin.dooring.vip/" target="_blank">https://nest-admin.dooring.vip/</el-link>
            </div>
            <div class="contact-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>微信：</span>
              <a href="javascript:;">taozhi10100</a>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" :md="12" :sm="24" :xs="24">
        <el-card class="products-card">
          <template #header>
            <div class="card-header">
              <el-icon><Goods /></el-icon>
              <span>更多优质产品</span>
            </div>
          </template>
          <div class="products-list">
            <div class="product-item">
              <el-link href="https://h5dooring.online" target="_blank">H5-Dooring</el-link>
            </div>
            <div class="product-item">
              <el-link href="https://v6.dooring.vip/" target="_blank">V6-Dooring</el-link>
            </div>
            <div class="product-item">
              <el-link href="https://board.dooring.vip/" target="_blank">创意白板</el-link>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { Monitor, ChatDotRound, Guide, Goods, Document, Promotion, Link } from '@element-plus/icons-vue'

const version = ref('1.0.0')

// 后端技术栈
const backendTechs = [
  { name: 'Node.js', type: 'success' },
  { name: 'NestJS', type: 'primary' },
  { name: 'TypeORM', type: 'warning' },
  { name: 'MySQL', type: 'danger' },
  { name: 'Redis', type: 'info' },
  { name: 'JWT', type: 'success' },
  { name: 'Swagger', type: 'primary' },
  { name: 'TypeScript', type: 'warning' }
]

// 前端技术栈
const frontendTechs = [
  { name: 'Vue 3', type: 'success' },
  { name: 'Element Plus', type: 'primary' },
  { name: 'Vite', type: 'warning' },
  { name: 'Pinia', type: 'danger' },
  { name: 'Vue Router', type: 'info' },
  { name: 'Axios', type: 'success' },
  { name: 'Sass', type: 'primary' },
  { name: 'ECharts', type: 'warning' }
]

// 接口文档列表
const apiDocs = [
  {
    name: 'Swagger UI',
    description: '交互式 API 文档，支持在线调试',
    icon: 'Promotion',
    url: 'http://localhost:8080/swagger-ui',
    type: 'primary'
  },
  {
    name: 'Redoc 文档',
    description: '美观的 API 文档展示，易于阅读',
    icon: 'Document',
    url: 'http://localhost:8080/docs',
    type: 'success'
  },
  {
    name: 'Apifox 导入',
    description: 'OpenAPI 规范文件，支持导入 Apifox',
    icon: 'Link',
    url: 'http://localhost:8080/openapi.json',
    type: 'warning'
  }
]

function goTarget(url) {
  window.open(url, '_blank')
}

function openApiDoc(url) {
  window.open(url, '_blank')
}
</script>

<style scoped lang="scss">
.home {
  font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: #676a6c;
  overflow-x: hidden;
  padding: 20px;

  .intro-section {
    margin-bottom: 30px;
  }

  .project-info {
    padding: 20px;

    .project-title {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
    }

    .project-desc {
      line-height: 1.8;
      color: #606266;
      margin-bottom: 20px;
    }

    .version-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;

      .version-label {
        font-weight: bold;
        color: #303133;
      }

      .version-number {
        font-size: 16px;
        color: #409eff;
        font-weight: 500;
      }

      .free-tag {
        margin-left: 10px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 15px;

      .el-button {
        min-width: 120px;
      }
    }
  }

  .tech-stack {
    padding: 20px;

    .section-title {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 20px;
      text-align: center;
    }

    .tech-card {
      height: 100%;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #303133;
      }

      .tech-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .tech-item {
          .el-tag {
            font-size: 13px;
            padding: 6px 12px;
          }
        }
      }
    }

    .backend-card {
      border-left: 4px solid #409eff;
    }

    .frontend-card {
      border-left: 4px solid #67c23a;
    }
  }

  .api-doc-section {
    margin: 30px 0;

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
          color: #409eff;
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
  }

  .info-section {
    .contact-card,
    .products-card {
      height: 100%;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #303133;
      }
    }

    .contact-info {
      .contact-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 15px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .el-icon {
          color: #409eff;
        }

        a {
          color: #409eff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .products-list {
      .product-item {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .el-link {
          font-size: 14px;
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;

    .project-info {
      padding: 15px;

      .project-title {
        font-size: 24px;
      }

      .action-buttons {
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }
    }

    .tech-stack {
      padding: 15px;

      .tech-card {
        margin-bottom: 20px;
      }
    }

    .api-doc-section {
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
