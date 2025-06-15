<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="公告标题" prop="noticeTitle">
        <el-input v-model="queryParams.noticeTitle" placeholder="请输入公告标题" clearable @keyup.enter="noticeTable.onSearch" />
      </el-form-item>
      <el-form-item label="操作人员" prop="createBy">
        <el-input v-model="queryParams.createBy" placeholder="请输入操作人员" clearable @keyup.enter="noticeTable.onSearch" />
      </el-form-item>
      <el-form-item label="类型" prop="noticeType">
        <el-select v-model="queryParams.noticeType" placeholder="请选择公告类型" clearable>
          <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :loading="noticeTable.state.loading" type="primary" icon="Search" @click="noticeTable.onSearch">搜索</el-button>
        <el-button :loading="noticeTable.state.loading" icon="Refresh" @click="noticeTable.onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:notice:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:notice:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="noticeTable.request" />
    </el-row>

    <el-table v-loading="noticeTable.state.loading" :data="noticeTable.state.list" @selection-change="handleSelectionChange">
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
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:notice:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:notice:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="noticeTable.state.page.total > 0"
      :total="noticeTable.state.page.total"
      v-model:page="noticeTable.state.page.pageNum"
      v-model:limit="noticeTable.state.page.pageSize"
      @pagination="noticeTable.request"
    />

    <!-- 添加或修改公告对话框 -->
    <el-dialog :title="noticeForm.state.title" v-model="noticeForm.state.open" width="800px" append-to-body>
      <el-form v-loading="noticeForm.state.loading" ref="noticeFormRef" :model="noticeForm.state.form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公告标题" prop="noticeTitle">
              <el-input v-model="noticeForm.state.form.noticeTitle" placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公告类型" prop="noticeType">
              <el-select v-model="noticeForm.state.form.noticeType" placeholder="请选择">
                <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="noticeForm.state.form.status">
                <el-radio v-for="dict in sys_notice_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容">
              <editor v-model="noticeForm.state.form.noticeContent" :min-height="192" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="noticeForm.state.loading" type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Notice">
const { proxy } = getCurrentInstance()
const { sys_notice_status, sys_notice_type } = proxy.useDict('sys_notice_status', 'sys_notice_type')

import { listNotice, getNotice, delNotice, addNotice, updateNotice } from '@/api/system/notice'
import useTable from '@/hooks/useTable'
import useForm from '@/hooks/useForm'

// 列表
const queryRef = ref()
const queryParams = reactive({
  noticeTitle: '',
  createBy: null,
  status: null
})
const noticeTable = useTable({ get: listNotice }, queryParams, queryRef)

// 表单
const noticeFormRef = ref()
const rules = {
  noticeTitle: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  noticeType: [{ required: true, message: '请选择公告类型', trigger: 'change' }]
}
const noticeForm = useForm({ add: addNotice, update: updateNotice, delete: delNotice, get: getNotice }, noticeFormRef, 'noticeId')

const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)

// 新增操作
const handleAdd = () => {
  noticeForm.onOpenForm()
}

// 修改操作
const handleUpdate = (row) => {
  noticeForm.onOpenForm(row)
}

// 提交按钮
const handleSubmit = () => {
  noticeFormRef.value.validate((valid) => {
    if (valid) {
      noticeForm.onSubmit().then(() => {
        noticeTable.request()
      })
    }
  })
}

// 取消弹窗
const handleCancel = () => {
  noticeForm.onCancel()
}

// 多选框选中数据
const handleSelectionChange = (selection) => {
  ids.value = selection.map((item) => item.noticeId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 删除操作
const handleDelete = (row) => {
  const noticeIds = row.noticeId || ids.value
  ElMessageBox.confirm('您确认删除该公告吗？', '删除提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    noticeForm.onRowDelete(noticeIds).then(() => {
      noticeTable.request()
    })
  })
}
</script>
