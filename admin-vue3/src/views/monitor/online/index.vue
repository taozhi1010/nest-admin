<template>
  <div class="app-container">
    <div class="main-card">
      <el-form ref="queryRef" v-no-enter :inline="true" :model="online.queryParams">
        <el-form-item label="登录地址" prop="ipaddr">
          <el-input v-model="online.queryParams.ipaddr" clearable placeholder="请输入登录地址" style="width: 200px" @keyup.enter="online.handleQuery" />
        </el-form-item>
        <el-form-item label="用户账号" prop="userName">
          <el-input v-model="online.queryParams.userName" clearable placeholder="请输入用户账号" style="width: 200px" @keyup.enter="online.handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="online.handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="online.resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="online.loading" :data="online.list" style="width: 100%">
        <el-table-column align="center" label="序号" type="index" width="50">
          <template #default="scope">
            <span>{{ (online.queryParams.pageNum - 1) * online.queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="会话编号" prop="tokenId" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="登录账号" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="所属部门" prop="deptName" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="主机" prop="ipaddr" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="登录地点" prop="loginLocation" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="操作系统" prop="os" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="浏览器" prop="browser" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="登录时间" prop="loginTime" width="180">
          <template #default="scope">
            <span>{{ scope.row.loginTime ? dayjs(scope.row.loginTime).format('YYYY-MM-DD HH:mm:ss') : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
          <template #default="scope">
            <el-button v-hasPermi="['monitor:online:forceLogout']" icon="Delete" link type="primary" @click="handleForceLogout(scope.row)">强退</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="online.total > 0" v-model:limit="online.queryParams.pageSize" v-model:page="online.queryParams.pageNum" :total="online.total" @pagination="online.getList" />
    </div>
  </div>
</template>

<script setup name="Online">
import { forceLogout, list as initData } from '@/api/monitor/online';
import { useCrud } from '@/composables/useCrud';

const queryRef = ref(null);

// 在线用户列表（仅查询与强退）
const online = useCrud({
  api: { list: initData },
  idKey: 'tokenId',
  name: '会话',
  query: { ipaddr: undefined, userName: undefined },
  queryRef
});

/** 强退按钮操作 */
const handleForceLogout = (row) => {
  ElMessageBox.confirm(`是否确认强退名称为"${row.userName}"的用户?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      return forceLogout(row.tokenId);
    })
    .then(() => {
      online.getList();
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// 初始化加载
online.getList();
</script>
