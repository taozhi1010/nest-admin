<template>
  <!-- 通知公告 -->
  <div class="app-container">
    <el-form :model="notice.queryParams" ref="queryRef" :inline="true" v-show="notice.showSearch">
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input v-model.trim="notice.queryParams.noticeTitle" placeholder="请输入公告标题" clearable
          @keyup.enter="notice.onSearch" />
      </el-form-item>
      <el-form-item label="操作人员" prop="createBy">
        <el-input v-model.trim="notice.queryParams.createBy" placeholder="请输入操作人员" clearable
          @keyup.enter="notice.onSearch" />
      </el-form-item>
      <el-form-item label="类型" prop="noticeType">
        <el-select v-model="notice.queryParams.noticeType" placeholder="公告类型" clearable style="width: 100px">
          <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :loading="notice.loading" type="primary" icon="Search" @click="notice.onSearch">搜索</el-button>
        <el-button :loading="notice.loading" icon="Refresh" @click="notice.onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="notice.handleAdd"
          v-hasPermi="['system:notice:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="notice.multiple" @click="notice.handleDelete"
          v-hasPermi="['system:notice:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="notice.showSearch" @queryTable="notice.getList" />
    </el-row>

    <el-table v-loading="notice.loading" :data="notice.list" @selection-change="notice.handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" align="center" width="60" />
      <el-table-column label="公告标题" align="center" prop="noticeTitle" :show-overflow-tooltip="true" />
      <el-table-column label="公告类型" align="center" prop="noticeType" width="100">
        <template #default="scope">
          <dict-tag :options="sys_notice_type" :value="scope.row.noticeType" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="sys_notice_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="notice.handleUpdate(scope.row)"
            v-hasPermi="['system:notice:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="notice.handleDelete(scope.row)"
            v-hasPermi="['system:notice:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="notice.queryParams.total > 0" :total="notice.queryParams.total"
      v-model:page="notice.queryParams.pageNum" v-model:limit="notice.queryParams.pageSize"
      @pagination="notice.getList" />

    <!-- 添加或修改公告对话框 -->
    <el-dialog :title="notice.title" v-model="notice.open" width="800px" append-to-body>
      <el-form v-loading="notice.formLoading" ref="noticeFormRef" :model="notice.form" :rules="notice.rules"
        label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公告标题" prop="noticeTitle">
              <el-input v-model.trim="notice.form.noticeTitle" placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公告类型" prop="noticeType">
              <el-select v-model="notice.form.noticeType" placeholder="请选择">
                <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="notice.form.status">
                <el-radio v-for="dict in sys_notice_status" :key="dict.value" :label="dict.value">{{ dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容">
              <editor v-model="notice.form.noticeContent" :min-height="192" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="notice.formLoading" type="primary" @click="notice.handleSubmit">确 定</el-button>
          <el-button @click="notice.handleCancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Notice">
import { nextTick } from 'vue'
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from '@/api/system/notice'
import { useDict } from '@/composables/useDict'
import { parseTime, resetForm } from '@/composables/useCommon'
import { useCatTools } from '@/composables/useCatTools'

const { proxy } = getCurrentInstance()
const { sys_notice_status, sys_notice_type } = useDict('sys_notice_status', 'sys_notice_type')
const { isNullorUndefined } = useCatTools()

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
    noticeType: [{ required: true, message: '请选择公告类型', trigger: 'change' }]
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
        if (isNullorUndefined(notice.form.noticeId)) {
          await addNotice(notice.form)
          proxy.$modal.msgSuccess('新增成功')
        } else {
          await updateNotice(notice.form)
          proxy.$modal.msgSuccess('修改成功')
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

  // 删除操作
  handleDelete: async (row) => {
    const noticeIds = isNullorUndefined(row.noticeId) ? notice.ids : row.noticeId
    try {
      await proxy.$modal.confirm('您确认删除该公告吗？', '删除提示')
      await delNotice(noticeIds)
      proxy.$modal.msgSuccess('删除成功')
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
