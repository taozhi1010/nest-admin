<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="logininfor.showSearch" ref="queryRef" v-no-enter :inline="true" label-width="68px" :model="logininfor.queryParams">
        <el-form-item label="登录地址" prop="ipaddr">
          <el-input v-model="logininfor.queryParams.ipaddr" clearable placeholder="请输入登录地址" style="width: 240px" @keyup.enter="logininfor.handleQuery" />
        </el-form-item>
        <el-form-item label="用户账号" prop="userName">
          <el-input v-model="logininfor.queryParams.userName" clearable placeholder="请输入用户账号" style="width: 240px" @keyup.enter="logininfor.handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="logininfor.queryParams.status" clearable placeholder="登录状态" style="width: 140px">
            <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录时间" style="width: 308px">
          <el-date-picker
            v-model="dateRange"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            end-placeholder="结束日期"
            range-separator="-"
            start-placeholder="开始日期"
            type="daterange"
            value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="logininfor.handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row class="mb8" :gutter="10">
        <el-col :span="1.5">
          <el-button v-hasPermi="['monitor:logininfor:remove']" :disabled="logininfor.multiple" icon="Delete" plain type="danger" @click="logininfor.handleDelete">删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['monitor:logininfor:remove']" icon="Delete" plain type="danger" @click="handleClean">清空</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['monitor:logininfor:unlock']" :disabled="logininfor.single" icon="Unlock" plain type="primary" @click="handleUnlock">解锁</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-hasPermi="['monitor:logininfor:export']" icon="Download" plain type="warning" @click="logininfor.handleExport">导出</el-button>
        </el-col>
        <right-toolbar v-model:show-search="logininfor.showSearch" @query-table="logininfor.getList" />
      </el-row>

      <el-table
        ref="logininforRef"
        v-loading="logininfor.loading"
        :data="logininfor.list"
        :default-sort="defaultSort"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange">
        <el-table-column align="center" type="selection" width="55" />
        <el-table-column align="center" label="访问编号" prop="infoId" />
        <el-table-column align="center" label="用户账号" prop="userName" :show-overflow-tooltip="true" :sort-orders="['descending', 'ascending']" sortable="custom" />
        <el-table-column align="center" label="地址" prop="ipaddr" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="登录地点" prop="loginLocation" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="操作系统" prop="os" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="浏览器" prop="browser" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="登录状态" prop="status">
          <template #default="scope">
            <span>{{ getDictLabel('sys_common_status', scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="描述" prop="msg" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="访问时间" prop="loginTime" :sort-orders="['descending', 'ascending']" sortable="custom" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.loginTime) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="logininfor.total > 0"
        v-model:limit="logininfor.queryParams.pageSize"
        v-model:page="logininfor.queryParams.pageNum"
        :total="logininfor.total"
        @pagination="logininfor.getList" />
    </div>
  </div>
</template>

<script setup name="Logininfor">
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from '@/api/monitor/logininfor';
import { addDateRange, parseTime } from '@/composables/useCommon';
import { useCrud } from '@/composables/useCrud';
import { useDict } from '@/composables/useDict';

const { sys_common_status, getDictLabel } = useDict('sys_common_status');

const logininforRef = ref(null);
const queryRef = ref(null);
const dateRange = ref([]);
const defaultSort = ref({ prop: 'loginTime', order: 'descending' });
const selectName = ref([]);

// 登录日志列表（无新增/编辑）
const logininfor = useCrud({
  api: {
    // 列表查询注入日期范围参数
    list: (params) => list(addDateRange(params, dateRange.value)),
    del: delLogininfor
  },
  idKey: 'infoId',
  name: '访问记录',
  query: { ipaddr: undefined, userName: undefined, status: undefined, orderByColumn: undefined, isAsc: undefined },
  exportUrl: 'monitor/logininfor/export',
  queryRef
});

// 重置按钮操作：额外清空日期范围并恢复默认排序
const baseResetQuery = logininfor.resetQuery;
const resetQuery = () => {
  dateRange.value = [];
  baseResetQuery();
  if (logininforRef.value) {
    logininforRef.value.sort(defaultSort.value.prop, defaultSort.value.order);
  }
};

// 多选框选中数据：记录选中账号供解锁使用
const handleSelectionChange = (selection) => {
  logininfor.handleSelectionChange(selection);
  selectName.value = selection.map((item) => item.userName);
};

// 排序触发事件
const handleSortChange = (column) => {
  logininfor.queryParams.orderByColumn = column.prop;
  logininfor.queryParams.isAsc = column.order;
  logininfor.getList();
};

// 清空按钮操作
const handleClean = async () => {
  try {
    await ElMessageBox.confirm('是否确认清空所有登录日志数据项？', '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await cleanLogininfor();
    ElMessage.success('清空成功');
    logininfor.getList();
  } catch (e) {
    if (e !== 'cancel') {
      console.error('清空失败:', e);
    }
  }
};

// 解锁按钮操作
const handleUnlock = async () => {
  const username = selectName.value;
  try {
    await ElMessageBox.confirm(`是否确认解锁用户"${username}"数据项？`, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await unlockLogininfor(username);
    ElMessage.success(`用户${username}解锁成功`);
  } catch (e) {
    if (e !== 'cancel') {
      console.error('解锁失败:', e);
    }
  }
};

// 初始化加载
logininfor.getList();
</script>
