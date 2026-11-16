<template>
  <div class="pagination-container" :class="{ hidden: hidden }">
    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :background="background" :layout="layout" :page-sizes="pageSizes" :pager-count="pagerCount" :total="total" @current-change="handleCurrentChange" @size-change="handleSizeChange" />
  </div>
</template>

<script setup lang="ts">
import { scrollTo } from '@/utils/scroll-to';

const props = defineProps({
  total: {
    required: true,
    type: Number
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array,
    default() {
      return [10, 20, 30, 50];
    }
  },
  // 移动端页码按钮的数量端默认�?
  pagerCount: {
    type: Number,
    default: document.body.clientWidth < 992 ? 5 : 7
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  hidden: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:page', 'update:limit', 'pagination']);
const currentPage = computed({
  get() {
    return props.page;
  },
  set(val) {
    emit('update:page', val);
  }
});
const pageSize = computed({
  get() {
    return props.limit;
  },
  set(val) {
    emit('update:limit', val);
  }
});
function handleSizeChange(val) {
  if (currentPage.value * val > props.total) {
    currentPage.value = 1;
  }
  emit('pagination', { page: currentPage.value, limit: val });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
}
function handleCurrentChange(val) {
  emit('pagination', { page: val, limit: pageSize.value });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
}
</script>

<style scoped>
/* 原散落在 ruoyi.scss/index.scss 全局的容器样式收编于此；数值为历次层叠后的实际生效值 */
.pagination-container {
  width: 100%;
  position: relative;
  height: 25px;
  margin-top: 30px;
  margin-bottom: 10px;
  padding: 10px 20px;
  background: #fff;

  .el-pagination {
    right: 0;
    position: absolute;
  }
}

.pagination-container.hidden {
  display: none;
}

@media (max-width: 768px) {
  .pagination-container :deep(.el-pagination__jump) {
    display: none !important;
  }

  .pagination-container :deep(.el-pagination__sizes) {
    display: none !important;
  }
}
</style>
