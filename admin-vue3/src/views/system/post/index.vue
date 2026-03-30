<template>
   <div class="app-container">
      <el-form :model="post.queryParams" ref="post.queryRef" :inline="true" v-show="post.showSearch">
         <el-form-item label="岗位编码" prop="postCode">
            <el-input v-model="post.queryParams.postCode" placeholder="请输入岗位编码" clearable style="width: 200px"
               @keyup.enter="post.handleQuery" />
         </el-form-item>
         <el-form-item label="岗位名称" prop="postName">
            <el-input v-model="post.queryParams.postName" placeholder="请输入岗位名称" clearable style="width: 200px"
               @keyup.enter="post.handleQuery" />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="post.queryParams.status" placeholder="岗位状态" clearable style="width: 200px">
               <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="post.handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="post.resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="post.handleAdd"
               v-hasPermi="['system:post:add']">新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="post.single" @click="post.handleUpdate"
               v-hasPermi="['system:post:edit']">修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="post.multiple" @click="post.handleDelete"
               v-hasPermi="['system:post:remove']">删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="post.handleExport"
               v-hasPermi="['system:post:export']">导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="post.showSearch" @queryTable="post.getList"></right-toolbar>
      </el-row>

      <el-table v-loading="post.loading" :data="post.postList" @selection-change="post.handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="岗位编号" align="center" prop="postId" />
         <el-table-column label="岗位编码" align="center" prop="postCode" />
         <el-table-column label="岗位名称" align="center" prop="postName" />
         <el-table-column label="岗位排序" align="center" prop="postSort" />
         <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="post.handleUpdate(scope.row)"
                  v-hasPermi="['system:post:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="post.handleDelete(scope.row)"
                  v-hasPermi="['system:post:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="post.total > 0" :total="post.total" v-model:page="post.queryParams.pageNum"
         v-model:limit="post.queryParams.pageSize" @pagination="post.getList" />

      <!-- 添加或修改岗位对话框 -->
      <el-dialog :title="post.title" v-model="post.open" width="500px" append-to-body>
         <el-form ref="post.postRef" :model="post.form" :rules="post.rules" label-width="80px">
            <el-form-item label="岗位名称" prop="postName">
               <el-input v-model="post.form.postName" placeholder="请输入岗位名称" />
            </el-form-item>
            <el-form-item label="岗位编码" prop="postCode">
               <el-input v-model="post.form.postCode" placeholder="请输入编码名称" />
            </el-form-item>
            <el-form-item label="岗位顺序" prop="postSort">
               <el-input-number v-model="post.form.postSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="岗位状态" prop="status">
               <el-radio-group v-model="post.form.status">
                  <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label
                     }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
               <el-input v-model="post.form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="Post">
import { listPost, addPost, delPost, getPost, updatePost } from "@/api/system/post"
import { useDict } from '@/composables/useDict'
import { resetForm, download, parseTime } from '@/composables/useCommon'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = useDict('sys_normal_disable')

// 岗位管理
const post = reactive({
   // 响应式数据
   queryRef: null,
   postRef: null,
   postList: [],
   open: false,
   loading: true,
   showSearch: true,
   ids: [],
   single: true,
   multiple: true,
   total: 0,
   title: "",

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
      postName: [{ required: true, message: "岗位名称不能为空", trigger: "blur" }],
      postCode: [{ required: true, message: "岗位编码不能为空", trigger: "blur" }],
      postSort: [{ required: true, message: "岗位顺序不能为空", trigger: "blur" }],
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
         status: "0",
         remark: undefined
      }
      resetForm(post.postRef)
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
      post.ids = selection.map(item => item.postId)
      post.single = selection.length !== 1
      post.multiple = !selection.length
   },

   // 新增按钮操作
   handleAdd: () => {
      post.reset()
      post.open = true
      post.title = "添加岗位"
   },

   // 修改按钮操作
   handleUpdate: async (row) => {
      post.reset()
      const postId = row.postId || post.ids
      try {
         const response = await getPost(postId)
         post.form = response.data
         post.open = true
         post.title = "修改岗位"
      } catch (e) {
         console.error('获取岗位信息失败:', e)
      }
   },

   // 提交按钮
   submitForm: () => {
      post.postRef.validate(async (valid) => {
         if (!valid) return

         try {
            if (post.form.postId !== undefined) {
               await updatePost(post.form)
               proxy.$modal.msgSuccess("修改成功")
            } else {
               await addPost(post.form)
               proxy.$modal.msgSuccess("新增成功")
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
         await proxy.$modal.confirm('是否确认删除岗位编号为"' + postIds + '"的数据项？')
         await delPost(postIds)
         proxy.$modal.msgSuccess("删除成功")
         post.getList()
      } catch (e) {
         if (e !== 'cancel') {
            console.error('删除失败:', e)
         }
      }
   },

   // 导出按钮操作
   handleExport: () => {
      download("system/post/export", {
         ...post.queryParams
      }, `post_${new Date().getTime()}.xlsx`)
   }
})

// 初始化加载
post.getList()
</script>
