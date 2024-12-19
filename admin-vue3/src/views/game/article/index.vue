<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入文章标题" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- todo: 状态字典翻译,数据字典有问题，目前的数据字典改完数据之后，前端的数据字典没有及时修改数据键值 -->
      <!-- <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="文章状态" clearable style="width: 200px">
          <el-option v-for="dict in sys_article_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['game:Article:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['game:Article:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['game:Article:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ArticleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文章标题" align="left" prop="title" show-overflow-tooltip />
      <el-table-column label="文章简介" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="文章作者" align="center" prop="author" />
      <el-table-column v-if="false" label="状态" align="center" prop="status">
        <template #default="scope">
          <!-- <dict-tag :options="sys_article_status" :value="scope.row.status" /> -->
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="publishTime" width="180">
        <template #default="scope">
          <!-- <span>{{ dayjs(scope.row.publishTime).format('YYYY-MM-DD HH:mm:ss') }}</span> -->
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180" />
      <el-table-column label="操作" width="240" align="center" fixed="right" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="table.handlePreview(scope.row)">预览</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['game:Article:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['game:Article:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改文章对话框 -->
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="ArticleRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" clearable maxlength="25" show-word-limit />
        </el-form-item>
        <el-form-item label="文章简介" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入文章简介" type="textarea" :rows="5" maxlength="200" show-word-limit />
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

    <Preview ref="PreviewRef" />
  </div>
</template>

<script setup name="Article">
import { listArticle, addArticle, delArticle, getArticle, updateArticle } from '@/api/game/Article'
import Preview from './components/Preview'

const { proxy } = getCurrentInstance()
const { sys_article_status } = proxy.useDict('sys_article_status')
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
  proxy.resetForm('ArticleRef')
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
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
  proxy.$refs['ArticleRef'].validate((valid) => {
    if (valid) {
      if (form.value.articleId != undefined) {
        updateArticle(form.value).then((res) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addArticle(form.value).then((res) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const articleIds = row.articleId || ids.value
  proxy.$modal
    .confirm('是否确认删除文章编号为"' + row.title + '"的数据项？')
    .then(function () {
      return delArticle(articleIds)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

getList()
</script>
