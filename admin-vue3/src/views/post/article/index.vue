<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="showSearch" ref="queryRef" v-no-enter :inline="true" :model="queryParams">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="queryParams.title" clearable placeholder="请输入文章标题" @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- todo: 状态字典翻译,数据字典有问题，目前的数据字典改完数据之后，前端的数据字典没有及时修改数据键值 -->
      <!-- <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="文章状态" clearable style="width: 200px">
          <el-option v-for="dict in sys_article_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['post:Article:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['post:Article:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['post:Article:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table v-loading="loading" :data="ArticleList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="left" label="文章标题" prop="title" show-overflow-tooltip min-width="200" />
      <el-table-column align="center" label="文章简介" prop="remark" show-overflow-tooltip min-width="200" />
      <el-table-column align="center" label="文章作者" prop="author" width="120" />
      <el-table-column v-if="false" align="center" label="状态" prop="status">
        <template #default="scope">
          <!-- <dict-tag :options="sys_article_status" :value="scope.row.status" /> -->
        </template>
      </el-table-column>
      <el-table-column align="center" label="发布时间" prop="publishTime" width="180">
        <template #default="scope">
          <!-- <span>{{ dayjs(scope.row.publishTime).format('YYYY-MM-DD HH:mm:ss') }}</span> -->
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
      <el-table-column align="center" label="修改时间" prop="updateTime" width="180" />
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="240">
        <template #default="scope">
          <el-button icon="View" link type="primary" @click="table.handlePreview(scope.row)">预览</el-button>
          <el-button v-hasPermi="['post:Article:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button v-hasPermi="['post:Article:remove']" icon="Delete" link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />

    <!-- 添加或修改文章对话框 -->
    <el-dialog v-model="open" append-to-body :title="title" width="600px">
      <el-form ref="ArticleRef" v-no-enter label-width="100px" :model="form" :rules="rules">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" clearable maxlength="25" placeholder="请输入文章标题" show-word-limit />
        </el-form-item>
        <el-form-item label="文章简介" prop="remark">
          <el-input v-model="form.remark" maxlength="200" placeholder="请输入文章简介" :rows="5" show-word-limit type="textarea" />
        </el-form-item>
        <!-- todo: 文件上传公用组件的封装 -->
        <!-- <el-form-item label="文章封面" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入编码名称" />
        </el-form-item> -->
        <!-- <el-form-item label="文章状态" prop="status">
          <el-select v-model="form.status" clearable>
            <el-option v-for="dict in sys_article_status" :value="dict.value">{{ dict.label }}</el-option>
          </el-select>
        </el-form-item> -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <preview ref="PreviewRef" />
    </div>
  </div>
</template>

<script setup name="Article">
import { listArticle, addArticle, delArticle, getArticle, updateArticle } from '@/api/post/article'
import Preview from './components/Preview'
import { useDict } from '@/composables/useDict'
import { resetForm } from '@/composables/useCommon'

const { sys_article_status } = useDict('sys_article_status')
console.log(sys_article_status, '数据字典')
console.log(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'), '字典')

const ArticleList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const ArticleRef = ref(null)
const PreviewRef = ref()

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ArticleCode: undefined,
    ArticleName: undefined,
    status: undefined,
    isAsc: 'descending',
    orderByColumn: 'createTime'
  },
  rules: {
    title: [{ required: true, message: '文章名称不能为空', trigger: 'blur' }],
    remark: [{ required: true, message: '文章简介不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

const table = reactive({
  handlePreview: (row) => {
    PreviewRef.value.handleOpen(row)
  }
})

/** 查询文章列表 */
function getList() {
  loading.value = true
  listArticle(queryParams.value).then((res) => {
    ArticleList.value = res.data.list
    ArticleList.value.forEach((item) => {
      item.updateTime = dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss')
      item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
      item.publishTime = dayjs(item.publishTime).format('YYYY-MM-DD HH:mm:ss')
    })
    total.value = res.data.total
    loading.value = false
  })
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = {
    articleId: undefined,
    ArticleCode: undefined,
    ArticleName: undefined,
    ArticleSort: 0,
    status: '0',
    remark: undefined,
    pushTime: dayjs().valueOf()
  }
  resetForm(ArticleRef)
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  resetForm(queryRef)
  handleQuery()
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.articleId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加文章'
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const articleId = row.articleId || ids.value
  getArticle(articleId).then((res) => {
    form.value = res.data
    open.value = true
    title.value = '修改文章'
  })
}
/** 提交按钮 */
function submitForm() {
  console.log(form.value)
  if (ArticleRef.value) {
    ArticleRef.value.validate((valid) => {
      if (valid) {
        if (form.value.articleId != undefined) {
          updateArticle(form.value).then((res) => {
            ElMessage.success('修改成功') 
            open.value = false
            getList()
          })
        } else {
          addArticle(form.value).then((res) => {
            ElMessage.success('新增成功')
            open.value = false
            getList()
          })
        }
      }
    })
  }
}
/** 删除按钮操作 */
function handleDelete(row) {
  const articleIds = row.articleId || ids.value
  ElMessageBox.confirm(`是否确认删除文章编号为"${row.title}"的数据项？`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return delArticle(articleIds)
    })
    .then(() => {
      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

getList()
</script>
