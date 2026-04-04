<template>
  <div class="app-container">
    <div class="main-card">
      <el-form ref="queryRef" :inline="true" :model="queryParams">
        <el-form-item label="登录地址" prop="ipaddr">
          <el-input v-model="queryParams.ipaddr" clearable placeholder="请输入登录地址" style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="用户账号" prop="userName">
          <el-input v-model="queryParams.userName" clearable placeholder="请输入用户账号" style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="onlineList" style="width: 100%">
        <el-table-column align="center" label="序号" type="index" width="50">
          <template #default="scope">
            <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
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
            <span>{{ parseTime(scope.row.loginTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
          <template #default="scope">
            <el-button v-hasPermi="['monitor:online:forceLogout']" icon="Delete" link type="primary" @click="handleForceLogout(scope.row)">强退</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:limit="pageSize" v-model:page="pageNum" :total="total" @pagination="getList" />
    </div>
  </div>
</template>

<script setup name="Online">
import { forceLogout, list as initData } from '@/api/monitor/online'
import { resetForm, parseTime } from '@/composables/useCommon'

const { proxy } = getCurrentInstance()

const onlineList = ref([])
const loading = ref(true)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const queryParams = ref({
  ipaddr: undefined,
  userName: undefined
})

/** 查询登录日志列表 */
function getList() {
  loading.value = true
  initData({
    ...queryParams.value,
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }).then((response) => {
    onlineList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}
/** 搜索按钮操作 */
function handleQuery() {
  pageNum.value = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  resetForm('queryRef')
  handleQuery()
}
/** 强退按钮操作 */
function handleForceLogout(row) {
  proxy.$modal
    .confirm(`是否确认强退名称为"${row.userName}"的用户?`)
    .then(function () {
      return forceLogout(row.tokenId)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

getList()
</script>
