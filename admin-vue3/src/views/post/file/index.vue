<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="showSearch" :inline="true" :model="query" @submit.prevent>
        <el-form-item label="文件名"><el-input v-model="query.fileName" clearable placeholder="请输入文件名" @keyup.enter="getList" /></el-form-item>
        <el-form-item label="扩展名">
          <el-select v-model="query.ext" clearable filterable placeholder="全部类型" style="width: 140px" @change="getList">
            <el-option v-for="item in extOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传时间">
          <el-date-picker v-model="dateRange" :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]" end-placeholder="结束日期" range-separator="-" start-placeholder="开始日期" style="width: 240px" type="daterange" value-format="YYYY-MM-DD HH:mm:ss" @change="getList" />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Search" type="primary" @click="getList">搜索</el-button>
          <el-button :icon="Refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-row class="mb8">
        <el-button v-hasPermi="['post:file:remove']" :disabled="!selected.length" :icon="Delete" plain type="danger" @click="remove">删除</el-button>
        <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
      </el-row>
      <el-table v-loading="loading" :data="list" :default-sort="{ prop: 'createTime', order: 'descending' }" @selection-change="selected = $event" @sort-change="handleSortChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="预览" width="80">
          <template #default="{ row }">
            <el-image v-if="isImage(row.ext) && row.url" :src="row.url" :preview-src-list="previewList" :initial-index="previewList.indexOf(row.url)" class="file-thumb" fit="cover" preview-teleported hide-on-click-modal />
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="文件名" prop="newFileName" show-overflow-tooltip />
        <el-table-column label="类型" prop="ext" width="100" />
        <el-table-column label="大小" prop="size" sortable="custom" width="120">
          <template #default="{ row }">{{ formatSize(row.size) }}</template>
        </el-table-column>
        <el-table-column label="上传时间" prop="createTime" sortable="custom" width="180">
          <template #default="{ row }">{{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }"><el-button v-hasPermi="['post:file:remove']" :icon="Delete" link type="danger" @click="remove(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" v-model:limit="query.pageSize" v-model:page="query.pageNum" :total="total" @pagination="getList" />
    </div>
  </div>
</template>
<script setup name="FileManagement">
import { Delete, Refresh, Search } from '@element-plus/icons-vue';

import { listFile, listFileExts, delFile } from '@/api/post/file';
const loading = ref(false);
const showSearch = ref(true);
const list = ref([]);
const selected = ref([]);
const total = ref(0);
const query = reactive({ pageNum: 1, pageSize: 10, fileName: '', ext: '', orderByColumn: undefined, isAsc: undefined });
const dateRange = ref([]);
const extOptions = ref([]);
listFileExts().then((res) => (extOptions.value = res.data));
const getList = async () => {
  loading.value = true;
  try {
    const params = { ...query, beginTime: dateRange.value?.[0], endTime: dateRange.value?.[1] };
    const res = await listFile(params);
    list.value = res.data.list;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
};
const handleSortChange = ({ prop, order }) => {
  query.orderByColumn = order ? prop : undefined;
  query.isAsc = order || undefined;
  getList();
};
const reset = () => {
  query.pageNum = 1;
  query.fileName = '';
  query.ext = '';
  query.orderByColumn = undefined;
  query.isAsc = undefined;
  dateRange.value = [];
  getList();
};
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.ico'];
const isImage = (ext) => IMAGE_EXTS.includes((ext || '').toLowerCase());
const previewList = computed(() => list.value.filter((item) => isImage(item.ext) && item.url).map((item) => item.url));
const formatSize = (size = 0) => (size < 1024 ? `${size} B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`);
const remove = async (row) => {
  const ids = row ? row.uploadId : selected.value.map((item) => item.uploadId);
  await ElMessageBox.confirm('确认删除选中的文件吗？');
  await delFile(ids.join(','));
  ElMessage.success('删除成功');
  getList();
};
getList();
</script>
<style scoped>
.file-thumb {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
