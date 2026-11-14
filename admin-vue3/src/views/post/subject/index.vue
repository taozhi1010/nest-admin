<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="subject.showSearch" ref="queryRef" v-no-enter :inline="true" :model="subject.queryParams">
      <el-form-item label="专栏名称" prop="title">
        <el-input v-model.trim="subject.queryParams.title" clearable placeholder="请输入专栏名称" @keyup.enter="subject.handleQuery" />
      </el-form-item>
      <el-form-item label="发布状态" prop="publishStatus">
        <el-select v-model="subject.queryParams.publishStatus" placeholder="发布状态" clearable style="width: 200px">
          <el-option v-for="dict in post_subject_publish_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="auditStatus">
        <el-select v-model="subject.queryParams.auditStatus" placeholder="审核状态" clearable style="width: 200px">
          <el-option v-for="dict in post_subject_audit_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="subject.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="subject.resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row class="mb8" :gutter="10">
      <el-col :span="1.5">
        <el-button v-hasPermi="['post:subject:add']" icon="Plus" plain type="primary" @click="subject.handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['post:subject:remove']" :disabled="subject.multiple" icon="Delete" plain type="danger" @click="subject.handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:show-search="subject.showSearch" @query-table="subject.getList" />
    </el-row>

    <el-table v-loading="subject.loading" :data="subject.list" @selection-change="subject.handleSelectionChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column align="left" label="专栏名称" prop="title" show-overflow-tooltip min-width="200" />
      <el-table-column align="center" label="专栏简介" prop="desc" show-overflow-tooltip min-width="200" />
      <el-table-column align="center" label="封面图片" prop="cover" width="120">
        <template #default="scope">
          <el-image v-if="scope.row.cover" :src="scope.row.cover" fit="cover" style="width: 80px; height: 60px" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="文章数量" prop="articleCount" width="100" />
      <el-table-column align="center" label="发布状态" prop="publishStatus" width="100">
        <template #default="scope">
          <span>{{ getDictLabel('post_subject_publish_status', scope.row.publishStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="审核状态" prop="auditStatus" width="100">
        <template #default="scope">
          <span>{{ getDictLabel('post_subject_audit_status', scope.row.auditStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" prop="sort" width="80" />
      <el-table-column align="center" label="创建时间" prop="createTime" width="180" />
      <el-table-column align="center" label="修改时间" prop="updateTime" width="180" />
      <el-table-column align="center" class-name="small-padding fixed-width" fixed="right" label="操作" width="180">
        <template #default="scope">
          <el-button v-hasPermi="['post:subject:edit']" icon="Edit" link type="primary" @click="subject.handleUpdate(scope.row)">修改</el-button>
          <el-button v-hasPermi="['post:subject:remove']" icon="Delete" link type="danger" @click="subject.handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="subject.total > 0" v-model:limit="subject.queryParams.pageSize" v-model:page="subject.queryParams.pageNum" :total="subject.total" @pagination="subject.getList" />

    <!-- 添加或修改专栏抽屉 -->
    <el-drawer v-model="subject.open" :title="subject.title" size="600px" direction="rtl">
      <el-form ref="subjectRef" v-no-enter label-width="100px" :model="subject.form" :rules="rules">
        <el-form-item label="专栏名称" prop="title">
          <el-input v-model.trim="subject.form.title" clearable maxlength="50" placeholder="请输入专栏名称" show-word-limit />
        </el-form-item>
        <el-form-item label="专栏简介" prop="desc">
          <el-input v-model.trim="subject.form.desc" maxlength="200" placeholder="请输入专栏简介" :rows="4" show-word-limit type="textarea" />
        </el-form-item>
        <el-form-item label="封面图片" prop="cover">
          <ImageUploadCover v-model="subject.form.cover" path="subject" :max-size="5" :quality="0.85" :before-upload-check="subject.validateBeforeUpload" />
        </el-form-item>
        <el-form-item label="发布状态" prop="publishStatus">
          <el-radio-group v-model="subject.form.publishStatus">
            <el-radio v-for="dict in post_subject_publish_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核状态" prop="auditStatus">
          <el-radio-group v-model="subject.form.auditStatus">
            <el-radio v-for="dict in post_subject_audit_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="subject.form.sort" :min="0" :step="1" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button type="primary" @click="subject.submitForm">确 定</el-button>
          <el-button @click="subject.cancel">取 消</el-button>
        </div>
      </template>
    </el-drawer>
    </div>
  </div>
</template>

<script setup name="Subject">
// ==================== 导入区域 ====================
import { listSubject, addSubject, delSubject, getSubject, updateSubject } from '@/api/post/subject'
import { useDict } from '@/composables/useDict'
import { useCrud } from '@/composables/useCrud'
import ImageUploadCover from '@/components/ImageUploadCover/index.vue'

const { post_subject_publish_status, post_subject_audit_status, getDictLabel } = useDict('post_subject_publish_status', 'post_subject_audit_status')

// ==================== 表单引用 ====================
const subjectRef = ref(null)
const queryRef = ref(null)

// 表单校验规则
const rules = {
  title: [{ required: true, message: '专栏名称不能为空', trigger: 'blur' }],
  desc: [{ required: true, message: '专栏简介不能为空', trigger: 'blur' }]
}

// ==================== 专栏管理 ====================
const subject = useCrud({
  api: {
    list: async (params) => {
      const res = await listSubject(params)
      // 格式化时间字段
      res.data.list.forEach((item) => {
        if (item.createTime) {
          item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
        }
        if (item.updateTime) {
          item.updateTime = dayjs(item.updateTime).format('YYYY-MM-DD HH:mm:ss')
        }
      })
      return res
    },
    get: getSubject,
    add: addSubject,
    update: updateSubject,
    del: delSubject
  },
  idKey: 'id',
  name: '专栏',
  query: { title: undefined, publishStatus: undefined, auditStatus: undefined, isAsc: 'descending', orderByColumn: 'createTime' },
  form: { id: undefined, title: undefined, desc: undefined, cover: undefined, publishStatus: '1', auditStatus: '0', sort: 0 },
  texts: {
    // 单行删除带专栏标题
    deleteConfirm: (ids, row) => `是否确认删除专栏${row?.title ? `"${row.title}"` : `编号为"${ids}"的数据项`}？`
  },
  queryRef,
  formRef: subjectRef
})

// 上传前验证：必须填写标题和简介
const validateBeforeUpload = () => {
  if (!subject.form.title || !subject.form.title.trim()) {
    ElMessage.warning('请先填写专栏名称')
    return false
  }
  if (!subject.form.desc || !subject.form.desc.trim()) {
    ElMessage.warning('请先填写专栏简介')
    return false
  }
  return true
}

// 初始化加载
subject.getList()
</script>
