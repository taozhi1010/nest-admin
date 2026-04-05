<template>
  <!-- 岗位管理 -->
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="post.showSearch" ref="post.queryRef" :inline="true" :model="post.queryParams">
      <el-form-item label="岗位编码" prop="postCode">
        <el-input v-model.trim="post.queryParams.postCode" clearable placeholder="请输入岗位编码" style="width: 200px" @keyup.enter="post.handleQuery" />
      </el-form-item>
      <el-form-item label="岗位名称" prop="postName">
        <el-input v-model.trim="post.queryParams.postName" clearable placeholder="请输入岗位名称" style="width: 200px" @keyup.enter="post.handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="post.queryParams.status" clearable placeholder="岗位状态" style="width: 200px">
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="post.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="post.resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:post:add']" icon="Plus" plain type="primary" @click="post.handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:post:remove']" :disabled="post.multiple" icon="Delete" plain type="danger" @click="post.handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:post:export']" icon="Download" plain type="warning" @click="post.handleExport">导出</el-button>
      </el-col>
      <right-toolbar v-model:show-search="post.showSearch" @query-table="post.getList" />
    </el-row>

    <el-table v-loading="post.loading" :data="post.postList" @selection-change="post.handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="center" label="岗位编号" prop="postId" />
      <el-table-column align="center" label="岗位编码" prop="postCode" />
      <el-table-column align="center" label="岗位名称" prop="postName" />
      <el-table-column align="center" label="岗位排序" prop="postSort" />
      <el-table-column align="center" label="状态" prop="status">
        <template #default="scope">
          <span>{{ getDictLabel('sys_normal_disable', scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="180">
        <template #default="scope">
          <el-button v-hasPermi="['system:post:edit']" icon="Edit" link type="primary" @click="post.handleUpdate(scope.row)">修改</el-button>
          <el-button v-hasPermi="['system:post:remove']" icon="Delete" link type="primary" @click="post.handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="post.total > 0" v-model:limit="post.queryParams.pageSize" v-model:page="post.queryParams.pageNum" :total="post.total" @pagination="post.getList" />

    <!-- 添加或修改岗位对话框 -->
    <el-dialog v-model="post.open" append-to-body :title="post.title" width="500px">
      <el-form ref="postRef" label-width="80px" :model="post.form" :rules="post.rules">
        <el-form-item label="岗位名称" prop="postName">
          <el-input v-model.trim="post.form.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model.trim="post.form.postCode" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="岗位顺序" prop="postSort">
          <el-input-number v-model.trim="post.form.postSort" controls-position="right" :min="0" placeholder="请输入岗位顺序" />
        </el-form-item>
        <el-form-item label="岗位状态" prop="status">
          <el-radio-group v-model="post.form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="post.form.remark" clearable maxlength="500" placeholder="请输入备注内容" show-word-limit type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="post.submitForm">确 定</el-button>
          <el-button @click="post.cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script setup name="Post">
import { listPost, addPost, delPost, getPost, updatePost } from '@/api/system/post'
import { useDict } from '@/composables/useDict'
import { resetForm, download, parseTime } from '@/composables/useCommon'

const { sys_normal_disable, getDictLabel } = useDict('sys_normal_disable')

// 模板引用
const postRef = ref(null)

// 岗位管理
const post = reactive({
  // 响应式数据
  queryRef: null,
  postList: [],
  open: false,
  loading: true,
  showSearch: true,
  ids: [],
  single: true,
  multiple: true,
  total: 0,
  title: '',

  // 表单和查询参数
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    postCode: undefined,
    postName: undefined,
    status: undefined
  },
  rules: {
    postName: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }],
    postCode: [{ required: true, message: '岗位编码不能为空', trigger: 'blur' }],
    postSort: [{ required: true, message: '岗位顺序不能为空', trigger: 'blur' }]
  },

  // 方法集合
  // 查询岗位列表
  getList: async () => {
    post.loading = true
    try {
      const response = await listPost(post.queryParams)
      post.postList = response.data.list
      post.total = response.data.total
    } finally {
      post.loading = false
    }
  },

  // 取消按钮
  cancel: () => {
    post.open = false
    post.reset()
  },

  // 表单重置
  reset: () => {
    post.form = {
      postId: undefined,
      postCode: undefined,
      postName: undefined,
      postSort: 0,
      status: '0',
      remark: undefined
    }
    resetForm(postRef.value)
  },

  // 搜索按钮操作
  handleQuery: () => {
    post.queryParams.pageNum = 1
    post.getList()
  },

  // 重置按钮操作
  resetQuery: () => {
    resetForm(post.queryRef)
    post.handleQuery()
  },

  // 多选框选中数据
  handleSelectionChange: (selection) => {
    post.ids = selection.map((item) => item.postId)
    post.single = selection.length !== 1
    post.multiple = !selection.length
  },

  // 新增按钮操作
  handleAdd: () => {
    post.reset()
    post.open = true
    post.title = '添加岗位'
  },

  // 修改按钮操作
  handleUpdate: async (row) => {
    post.reset()
    const postId = row.postId || post.ids
    try {
      const response = await getPost(postId)
      post.form = response.data
      post.open = true
      post.title = '修改岗位'
    } catch (e) {
      console.error('获取岗位信息失败:', e)
    }
  },

  // 提交按钮
  submitForm: () => {
    postRef.value.validate(async (valid) => {
      if (!valid) return

      try {
        if (post.form.postId !== undefined) {
          await updatePost(post.form)
          ElMessage.success('修改成功')
        } else {
          await addPost(post.form)
          ElMessage.success('新增成功')
        }
        post.open = false
        post.getList()
      } catch (e) {
        console.error('提交失败:', e)
      }
    })
  },

  // 删除按钮操作
  handleDelete: async (row) => {
    const postIds = row.postId || post.ids
    try {
      await ElMessageBox.confirm(`是否确认删除岗位编号为"${postIds}"的数据项？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await delPost(postIds)
      ElMessage.success('删除成功')
      post.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('删除失败:', e)
      }
    }
  },

  // 导出按钮操作
  handleExport: () => {
    download(
      'system/post/export',
      {
        ...post.queryParams
      },
      `post_${new Date().getTime()}.xlsx`
    )
  }
})

// 初始化加载
post.getList()
</script>
