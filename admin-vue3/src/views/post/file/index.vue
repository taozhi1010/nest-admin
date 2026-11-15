<template>
  <div class="app-container"><div class="main-card">
    <el-form v-show="showSearch" :inline="true" :model="query" @submit.prevent>
      <el-form-item label="文件名"><el-input v-model="query.fileName" clearable placeholder="请输入文件名" @keyup.enter="getList" /></el-form-item>
      <el-form-item label="扩展名"><el-input v-model="query.ext" clearable placeholder="如 .png" @keyup.enter="getList" /></el-form-item>
      <el-form-item><el-button :icon="Search" type="primary" @click="getList">搜索</el-button><el-button :icon="Refresh" @click="reset">重置</el-button></el-form-item>
    </el-form>
    <el-row class="mb8"><el-button v-hasPermi="['post:file:remove']" :disabled="!selected.length" :icon="Delete" plain type="danger" @click="remove">删除</el-button><right-toolbar v-model:show-search="showSearch" @query-table="getList" /></el-row>
    <el-table v-loading="loading" :data="list" @selection-change="selected = $event"><el-table-column type="selection" width="55" /><el-table-column label="文件名" prop="newFileName" show-overflow-tooltip /><el-table-column label="类型" prop="ext" width="100" /><el-table-column label="大小" width="120"><template #default="{ row }">{{ formatSize(row.size) }}</template></el-table-column><el-table-column label="上传时间" prop="createTime" width="180" /><el-table-column label="操作" width="100"><template #default="{ row }"><el-button v-hasPermi="['post:file:remove']" :icon="Delete" link type="danger" @click="remove(row)">删除</el-button></template></el-table-column></el-table>
    <pagination v-show="total > 0" v-model:limit="query.pageSize" v-model:page="query.pageNum" :total="total" @pagination="getList" />
  </div></div>
</template>
<script setup name="FileManagement">
import { Delete, Refresh, Search } from '@element-plus/icons-vue';
import { listFile, delFile } from '@/api/post/file';
const loading = ref(false); const showSearch = ref(true); const list = ref([]); const selected = ref([]); const total = ref(0);
const query = reactive({ pageNum: 1, pageSize: 10, fileName: '', ext: '' });
const getList = async () => { loading.value = true; try { const res = await listFile(query); list.value = res.data.list; total.value = res.data.total; } finally { loading.value = false; } };
const reset = () => { query.pageNum = 1; query.fileName = ''; query.ext = ''; getList(); };
const formatSize = (size) => size < 1024 ? `${size} B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;
const remove = async (row) => { const ids = row ? row.uploadId : selected.value.map((item) => item.uploadId); await ElMessageBox.confirm('确认删除选中的文件吗？'); await delFile(ids.join(',')); ElMessage.success('删除成功'); getList(); };
getList();
</script>
