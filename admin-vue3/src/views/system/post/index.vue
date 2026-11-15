<template>
  <!-- 岗位管理 -->
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="post.showSearch" ref="queryRef" v-no-enter :inline="true" :model="post.queryParams">
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
          <el-button :icon="Search" type="primary" @click="post.handleQuery">搜索</el-button>
          <el-button :icon="Refresh" @click="post.resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row class="mb8" :gutter="10">
        <el-col :span="1.5">
          <el-button v-hasPermi="['system:post:add']" :icon="Plus" plain type="primary" @click="post.handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['system:post:remove']" :disabled="post.multiple" :icon="Delete" plain type="danger" @click="post.handleDelete">删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['system:post:export']" :icon="Download" plain type="warning" @click="post.handleExport">导出</el-button>
        </el-col>
        <right-toolbar v-model:show-search="post.showSearch" @query-table="post.getList" />
      </el-row>

      <el-table v-loading="post.loading" :data="post.list" @selection-change="post.handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" label="岗位编号" prop="postId" />
        <el-table-column align="center" label="岗位编码" prop="postCode" />
        <el-table-column align="center" label="岗位名称" prop="postName" />
        <el-table-column align="center" label="岗位排序" prop="postSort" />
        <el-table-column align="center" label="状态" prop="status">
          <template #default="scope">
            <dict-tag type="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ scope.row.createTime ? dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss') : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="180">
          <template #default="scope">
            <el-button v-hasPermi="['system:post:edit']" :icon="Edit" link type="primary" @click="post.handleUpdate(scope.row)">修改</el-button>
            <el-button v-hasPermi="['system:post:remove']" :icon="Delete" link type="primary" @click="post.handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="post.total > 0" v-model:limit="post.queryParams.pageSize" v-model:page="post.queryParams.pageNum" :total="post.total" @pagination="post.getList" />

      <!-- 添加或修改岗位对话框 -->
      <el-dialog v-model="post.open" append-to-body :title="post.title" width="500px">
        <el-form ref="postRef" v-no-enter label-width="80px" :model="post.form" :rules="rules">
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
import { Delete, Download, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue';

import { listPost, addPost, delPost, getPost, updatePost } from '@/api/system/post';
import { useCrud } from '@/composables/useCrud';
import { useDict } from '@/composables/useDict';

const { sys_normal_disable } = useDict('sys_normal_disable');

// 模板引用
const postRef = ref(null);
const queryRef = ref(null);

// 表单校验规则
const rules = {
  postName: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }],
  postCode: [{ required: true, message: '岗位编码不能为空', trigger: 'blur' }],
  postSort: [{ required: true, message: '岗位顺序不能为空', trigger: 'blur' }]
};

// 岗位管理
const post = useCrud({
  api: { list: listPost, get: getPost, add: addPost, update: updatePost, del: delPost },
  idKey: 'postId',
  name: '岗位',
  query: { postCode: undefined, postName: undefined, status: undefined },
  form: { postId: undefined, postCode: undefined, postName: undefined, postSort: 0, status: '0', remark: undefined },
  exportUrl: 'system/post/export',
  queryRef,
  formRef: postRef
});

// 初始化加载
post.getList();
</script>
