<template>
  <div class="auth-demo">
    <h2>权限验证示例</h2>
    
    <!-- 基本权限验证 -->
    <div class="section">
      <h3>基本权限验证</h3>
      <button v-if="hasPermi('system:user:add')" class="btn btn-primary">
        添加用户 (需要 system:user:add 权限)
      </button>
      
      <button v-if="hasPermi('system:user:edit')" class="btn btn-warning">
        编辑用户 (需要 system:user:edit 权限)
      </button>
    </div>

    <!-- 多权限验证 - 或关系 -->
    <div class="section">
      <h3>多权限验证 (满足任一)</h3>
      <button v-if="hasPermiOr(['system:user:delete', 'system:user:batch-delete'])" class="btn btn-danger">
        删除用户 (需要 delete 或 batch-delete 权限)
      </button>
    </div>

    <!-- 多权限验证 - 与关系 -->
    <div class="section">
      <h3>多权限验证 (全部满足)</h3>
      <div v-if="hasPermiAnd(['system:user:view', 'system:user:export'])" class="info-box">
        <p>您拥有查看和导出用户的完整权限</p>
        <button class="btn btn-success">导出数据</button>
      </div>
    </div>

    <h2>角色验证示例</h2>
    
    <!-- 基本角色验证 -->
    <div class="section">
      <h3>基本角色验证</h3>
      <div v-if="hasRole('admin')" class="role-badge admin">
        管理员面板
      </div>
      
      <div v-if="hasRole('user')" class="role-badge user">
        用户面板
      </div>
    </div>

    <!-- 多角色验证 - 或关系 -->
    <div class="section">
      <h3>多角色验证 (满足任一)</h3>
      <div v-if="hasRoleOr(['manager', 'supervisor'])" class="role-badge manager">
        管理面板 (经理或主管可见)
      </div>
    </div>

    <!-- 多角色验证 - 与关系 -->
    <div class="section">
      <h3>多角色验证 (全部满足)</h3>
      <div v-if="hasRoleAnd(['admin', 'auditor'])" class="role-badge super-admin">
        超级管理员审计面板
      </div>
    </div>

    <!-- 动态权限控制示例 -->
    <div class="section">
      <h3>动态权限控制</h3>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="age" label="年龄" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button 
              v-if="hasPermi('system:user:edit')" 
              size="small" 
              type="primary"
            >
              编辑
            </el-button>
            <el-button 
              v-if="hasPermi('system:user:delete')" 
              size="small" 
              type="danger"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// useAuth 会自动导入，无需手动 import
const { 
  hasPermi,
  hasPermiOr, 
  hasPermiAnd,
  hasRole,
  hasRoleOr,
  hasRoleAnd
} = useAuth()

// 示例表格数据
const tableData = ref([
  { name: '张三', age: 25 },
  { name: '李四', age: 30 },
  { name: '王五', age: 28 }
])
</script>

<style scoped>
.auth-demo {
  padding: 20px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.btn {
  padding: 8px 16px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-warning {
  background-color: #e6a23c;
  color: white;
}

.btn-danger {
  background-color: #f56c6c;
  color: white;
}

.btn-success {
  background-color: #67c23a;
  color: white;
}

.info-box {
  padding: 15px;
  background-color: #f0f9ff;
  border: 1px solid #409eff;
  border-radius: 4px;
}

.role-badge {
  display: inline-block;
  padding: 8px 16px;
  margin: 5px;
  border-radius: 20px;
  color: white;
  font-weight: bold;
}

.admin {
  background-color: #f56c6c;
}

.user {
  background-color: #409eff;
}

.manager {
  background-color: #e6a23c;
}

.super-admin {
  background-color: #67c23a;
}
</style>
