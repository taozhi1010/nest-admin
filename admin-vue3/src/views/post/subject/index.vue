<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" v-no-enter :inline="true" :model="queryParams">
      <el-form-item label="专栏名称" prop="name">
        <el-input v-model="queryParams.name" clearable placeholder="请输入专栏名称" style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="专栏状态" clearable style="width: 200px">
          <el-option label="启用" value="0" />
          <el-option label="禁用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['post:subject:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['post:subject:edit']" :disabled="single" icon="Edit" plain type="success" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['post:subject:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
    </el-row>

    <el-table v-loading="loading" :data="subjectList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="left" label="专栏名称" prop="name" show-overflow-tooltip />
      <el-table-column align="center" label="专栏简介" prop="description" show-overflow-tooltip />
      <el-table-column align="center" label="封面图片" prop="coverImage" width="120">
        <template #default="scope">
          <el-image v-if="scope.row.coverImage" :src="scope.row.coverImage" fit="cover" style="width: 80px; height: 60px" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="文章数量" prop="articleCount" width="100" />
      <el-table-column align="center" label="状态" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
            {{ scope.row.status === '0' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" prop="sort" width="80" />
      <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
      <el-table-column align="center" label="修改时间" prop="updateTime" width="180" />
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="180">
        <template #default="scope">
          <el-button v-hasPermi="['post:subject:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button v-hasPermi="['post:subject:remove']" icon="Delete" link type="primary" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum" :total="total" @pagination="getList" />

    <!-- 添加或修改专栏对话框 -->
    <el-dialog v-model="open" append-to-body :title="title" width="600px">
      <el-form ref="subjectRef" v-no-enter label-width="100px" :model="form" :rules="rules">
        <el-form-item label="专栏名称" prop="name">
          <el-input v-model="form.name" clearable maxlength="50" placeholder="请输入专栏名称" show-word-limit />
        </el-form-item>
        <el-form-item label="专栏简介" prop="description">
          <el-input v-model="form.description" maxlength="200" placeholder="请输入专栏简介" :rows="4" show-word-limit type="textarea" />
        </el-form-item>
        <el-form-item label="封面图片" prop="coverImage">
          <el-input v-model="form.coverImage" clearable placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="0">启用</el-radio>
            <el-radio value="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :step="1" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Subject">
import { listSubject, addSubject, delSubject, getSubject, updateSubject } from '@/api/post/subject'
import { resetForm } from '@/composables/useCommon'

const subjectList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const subjectRef = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: undefined,
    isAsc: 'descending',
    orderByColumn: 'createTime'
  },
  rules: {
    name: [{ required: true, message: '专栏名称不能为空', trigger: 'blur' }],
    description: [{ required: true, message: '专栏简介不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询专栏列表 */
function getList() {
  loading.value = true
  listSubject(queryParams.value).then((res) => {
    subjectList.value = res.data.list
    subjectList.value.forEach((item) => {
      if (item.createTime) {
        item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
      }
      if (item.updateTime) {
        item.updateTime = dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss')
      }
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
    subjectId: undefined,
    name: undefined,
    description: undefined,
    coverImage: undefined,
    status: '0',
    sort: 0
  }
  resetForm(subjectRef)
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
  ids.value = selection.map((item) => item.subjectId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加专栏'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const subjectId = row.subjectId || ids.value
  getSubject(subjectId).then((res) => {
    form.value = res.data
    open.value = true
    title.value = '修改专栏'
  })
}

/** 提交按钮 */
function submitForm() {
  if (subjectRef.value) {
    subjectRef.value.validate((valid) => {
      if (valid) {
        if (form.value.subjectId != undefined) {
          updateSubject(form.value).then(() => {
            ElMessage.success('修改成功')
            open.value = false
            getList()
          })
        } else {
          addSubject(form.value).then(() => {
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
  const subjectIds = row.subjectId || ids.value
  ElMessageBox.confirm(`是否确认删除专栏"${row.name}"？`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(function () {
      return delSubject(subjectIds)
    })
    .then(() => {
      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

getList()
</script>
