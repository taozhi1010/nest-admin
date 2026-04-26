<template>
  <!-- 通知公告 -->
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="notice.showSearch" ref="queryRef" v-no-enter :inline="true" :model="notice.queryParams">
        <el-form-item label="公告标题" prop="noticeTitle">
          <el-input v-model.trim="notice.queryParams.noticeTitle" clearable placeholder="请输入公告标题"
            @keyup.enter="notice.onSearch" />
        </el-form-item>
        <el-form-item label="操作人员" prop="createBy">
          <el-input v-model.trim="notice.queryParams.createBy" clearable placeholder="请输入操作人员"
            @keyup.enter="notice.onSearch" />
        </el-form-item>
        <el-form-item label="类型" prop="noticeType">
          <el-select v-model="notice.queryParams.noticeType" clearable placeholder="公告类型" style="width: 100px">
            <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" :loading="notice.loading" type="primary" @click="notice.onSearch">搜索</el-button>
          <el-button icon="Refresh" :loading="notice.loading" @click="notice.onReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row class="mb8" :gutter="10">
        <el-col :span="1.5">
          <el-button v-hasPermi="['system:notice:add']" icon="Plus" plain type="primary"
            @click="notice.handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['system:notice:remove']" :disabled="notice.multiple" icon="Delete" plain type="danger"
            @click="notice.handleDelete">删除</el-button>
        </el-col>
        <right-toolbar v-model:show-search="notice.showSearch" @query-table="notice.getList" />
      </el-row>

      <el-table v-loading="notice.loading" :data="notice.list" @selection-change="notice.handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" label="序号" type="index" width="60" />
        <el-table-column align="center" label="公告标题" prop="noticeTitle" :show-overflow-tooltip="true" min-width="300">
          <template #default="scope">
            <div style="display: flex; justify-content: center; align-items: center; gap: 8px; width: 100%;">
              <el-tag :type="getDictTagType('sys_notice_type', scope.row.noticeType)" effect="light" size="small">
                {{ getDictLabel('sys_notice_type', scope.row.noticeType) }}
              </el-tag>
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ scope.row.noticeTitle
              }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" prop="status" width="80">
          <template #default="scope">
            <span>{{ getDictLabel('sys_notice_status', scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建者" prop="createBy" width="100" />
        <el-table-column align="center" label="创建时间" prop="createTime" width="110">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="160">
          <template #default="scope">
            <el-button v-hasPermi="['system:notice:edit']" icon="Edit" link type="primary"
              @click="notice.handleUpdate(scope.row)">
              修改
            </el-button>
            <el-button v-hasPermi="['system:notice:remove']" icon="Delete" link type="danger"
              @click="notice.handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="notice.queryParams.total > 0" v-model:limit="notice.queryParams.pageSize"
        v-model:page="notice.queryParams.pageNum" :total="notice.queryParams.total" @pagination="notice.getList" />

      <!-- 添加或修改公告抽屉 -->
      <el-drawer v-model="notice.open" :title="notice.title" append-to-body class="drawer-full-width notice-drawer">
        <div class="drawer-content">
          <el-form ref="noticeFormRef" v-no-enter v-loading="notice.formLoading" label-width="80px" :model="notice.form"
            :rules="notice.rules" class="notice-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="公告标题" prop="noticeTitle">
                  <el-input v-model.trim="notice.form.noticeTitle" placeholder="请输入公告标题" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="公告类型" prop="noticeType">
                  <el-select v-model="notice.form.noticeType" placeholder="请选择">
                    <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label"
                      :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="状态" prop="status">
                  <el-radio-group v-model="notice.form.status">
                    <el-radio v-for="dict in sys_notice_status" :key="dict.value" :label="dict.value">
                      {{ dict.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="文章内容" prop="noticeContent" label-position="top" class="editor-form-item">
              <MdEditor v-model="notice.form.noticeContent" height="60vh" @change="handleContentChange" />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <div class="drawer-footer">
            <el-button :loading="notice.formLoading" type="primary" @click="notice.handleSubmit">确 定</el-button>
            <el-button @click="notice.handleCancel">取 消</el-button>
          </div>
        </template>
      </el-drawer>
    </div>
  </div>
</template>

<script setup name="Notice">
import { nextTick } from 'vue'
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from '@/api/system/notice'
import { useDict } from '@/composables/useDict'
import { parseTime } from '@/composables/useCommon'
import { resetForm } from '@/composables/useForm'
import { isEmpty } from 'radash'
import MdEditor from '@/components/MdEditor'

const { sys_notice_status, sys_notice_type, getDictLabel, getDictTagType } = useDict('sys_notice_status', 'sys_notice_type')

// 表单 ref
const queryRef = ref()
const noticeFormRef = ref()

// 公告管理
const notice = reactive({
  // 响应式数据
  showSearch: true,
  ids: [],
  single: true,
  multiple: true,

  // 查询参数（包含分页）
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    noticeTitle: '',
    createBy: null,
    status: null,
    total: 0
  },

  // 表单状态
  form: {},
  title: '',
  open: false,
  formLoading: false,

  // 表单验证规则
  rules: {
    noticeTitle: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
    noticeType: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
    noticeContent: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
  },

  // 方法集合
  // 查询列表
  getList: async () => {
    notice.loading = true
    try {
      const response = await listNotice(notice.queryParams)
      notice.list = response.data.list
      notice.queryParams.total = response.data.total
    } finally {
      notice.loading = false
    }
  },

  // 搜索按钮
  onSearch: () => {
    notice.queryParams.pageNum = 1
    notice.getList()
  },

  // 重置按钮
  onReset: () => {
    resetForm(queryRef.value)
    notice.onSearch()
  },

  // 多选框选中数据
  handleSelectionChange: (selection) => {
    notice.ids = selection.map((item) => item.noticeId)
    notice.single = selection.length !== 1
    notice.multiple = !selection.length
  },

  // 新增操作
  handleAdd: () => {
    notice.form = {
      noticeType: '1', // 默认选中第一个类型（通知公告）
      status: '0' // 默认启用状态
    }
    notice.title = '添加公告'
    notice.open = true
  },

  // 修改操作
  handleUpdate: async (row) => {
    notice.form = {
      noticeType: '1',
      status: '0'
    }
    notice.title = '修改公告'
    notice.open = true
    notice.formLoading = true
    try {
      const response = await getNotice(row.noticeId)
      notice.form = response.data
    } catch (e) {
      console.error('获取公告信息失败:', e)
    } finally {
      notice.formLoading = false
    }
  },

  // 提交按钮
  handleSubmit: () => {
    if (!noticeFormRef.value) return

    noticeFormRef.value.validate(async (valid) => {
      if (!valid) return

      notice.formLoading = true
      try {
        if (isEmpty(notice.form.noticeId)) {
          await addNotice(notice.form)
          ElMessage.success('新增成功')
        } else {
          await updateNotice(notice.form)
          ElMessage.success('修改成功')
        }
        notice.open = false
        notice.getList()
      } catch (e) {
        console.error('提交失败:', e)
      } finally {
        notice.formLoading = false
      }
    })
  },

  // 取消弹窗
  handleCancel: () => {
    notice.open = false
    notice.form = {
      noticeType: '1',
      status: '0'
    }
    // 重置表单验证
    nextTick(() => {
      noticeFormRef.value?.resetFields()
    })
  },

  // Markdown 内容变化
  handleContentChange: ({ text, html }) => {
    // 内容变化时的处理逻辑
  },

  // 删除操作
  handleDelete: async (row) => {
    const noticeIds = isEmpty(row.noticeId) ? notice.ids : row.noticeId
    try {
      await ElMessageBox.confirm('您确认删除该公告吗？', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await delNotice(noticeIds)
      ElMessage.success('删除成功')
      notice.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('删除失败:', e)
      }
    }
  }
})

// 初始化加载
notice.getList()
</script>

<style lang="scss" scoped>
:deep(.notice-drawer) {
  .el-drawer__header {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }

  .el-drawer__body {
    display: flex;
    flex-direction: column;
    padding: 20px;
    height: 100%;
  }

  .drawer-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }
}

.notice-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}

.form-header {
  flex-shrink: 0;
}

.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  margin-top: 10px;

  :deep(.editor-form-item) {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
    height: 100%;
  }

  :deep(.el-form-item__content) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
  }
}

:deep(.md-editor) {
  height: 100% !important;
  flex: 1;
  min-height: 300px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-top: 20px;
}
</style>
