<template>
  <div class="error-401-container">
    <div class="error-content">
      <div class="error-icon">
        <el-icon :size="180" color="#E6A23C">
          <WarningFilled />
        </el-icon>
      </div>
      <div class="error-text">
        <h1 class="error-title">401</h1>
        <h2 class="error-subtitle">未授权访问</h2>
        <p class="error-description">
          抱歉，您没有权限访问此页面。<br>请联系管理员获取相应权限。
        </p>
        <div class="error-actions">
          <el-button type="primary" @click="back">
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
          <el-button @click="goHome">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { WarningFilled, ArrowLeft, House } from '@element-plus/icons-vue';

const router = useRouter();

function back() {
  router.back();
}

function goHome() {
  router.push('/');
}
</script>

<style lang="scss" scoped>
.error-401-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;

  .error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 16px;
    padding: 60px 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 100%;
    animation: fadeIn 0.5s ease-out;

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .error-icon {
      margin-bottom: 30px;
      animation: float 3s ease-in-out infinite;

      @keyframes float {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
    }

    .error-text {
      text-align: center;

      .error-title {
        font-size: 72px;
        font-weight: 700;
        color: #E6A23C;
        margin: 0 0 10px 0;
        line-height: 1;
      }

      .error-subtitle {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 20px 0;
      }

      .error-description {
        font-size: 14px;
        color: #909399;
        line-height: 1.8;
        margin: 0 0 30px 0;
      }

      .error-actions {
        display: flex;
        gap: 12px;
        justify-content: center;

        .el-button {
          min-width: 120px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .error-401-container {
    padding: 10px;

    .error-content {
      padding: 40px 20px;

      .error-icon {
        :deep(.el-icon) {
          font-size: 120px !important;
        }
      }

      .error-text {
        .error-title {
          font-size: 56px;
        }

        .error-subtitle {
          font-size: 20px;
        }

        .error-description {
          font-size: 13px;
        }

        .error-actions {
          flex-direction: column;
          
          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
