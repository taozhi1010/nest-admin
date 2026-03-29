<template>
  <div class="app-container">
    <el-form :model="logininfor.queryParams" ref="logininfor.queryRef" :inline="true" v-show="logininfor.showSearch"
      label-width="68px">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input v-model="logininfor.queryParams.ipaddr" placeholder="请输入登录地址" clearable style="width: 240px"
          @keyup.enter="logininfor.handleQuery" />
      </el-form-item>
      <el-form-item label="用户账号" prop="userName">
        <el-input v-model="logininfor.queryParams.userName" placeholder="请输入用户账号" clearable style="width: 240px"
          @keyup.enter="logininfor.handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="logininfor.queryParams.status" placeholder="登录状态" clearable style="width: 240px">
          <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="登录时间" style="width: 308px">
        <el-date-picker v-model="logininfor.dateRange" value-format="YYYY-MM-DD HH:mm:ss" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="logininfor.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="logininfor.resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="logininfor.multiple" @click="logininfor.handleDelete"
          v-hasPermi="['monitor:logininfor:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" @click="logininfor.handleClean"
          v-hasPermi="['monitor:logininfor:remove']">清空</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Unlock" :disabled="logininfor.single" @click="logininfor.handleUnlock"
          v-hasPermi="['monitor:logininfor:unlock']">解锁</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="logininfor.handleExport"
          v-hasPermi="['monitor:logininfor:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="logininfor.showSearch" @queryTable="logininfor.getList"></right-toolbar>
    </el-row>

    <el-table ref="logininfor.logininforRef" v-loading="logininfor.loading" :data="logininfor.list"
      @selection-change="logininfor.handleSelectionChange" :default-sort="logininfor.defaultSort"
      @sort-change="logininfor.handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="访问编号" align="center" prop="infoId" />
      <el-table-column label="用户账号" align="center" prop="userName" :show-overflow-tooltip="true" sortable="custom"
        :sort-orders="['descending', 'ascending']" />
      <el-table-column label="地址" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="操作系统" align="center" prop="os" :show-overflow-tooltip="true" />
      <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column label="登录状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="msg" :show-overflow-tooltip="true" />
      <el-table-column label="访问时间" align="center" prop="loginTime" sortable="custom"
        :sort-orders="['descending', 'ascending']" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="logininfor.total > 0" :total="logininfor.total" v-model:page="logininfor.queryParams.pageNum"
      v-model:limit="logininfor.queryParams.pageSize" @pagination="logininfor.getList" />
  </div>
</template>

<script setup name="Logininfor">
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from '@/api/monitor/logininfor'
import { useDict } from '@/composables/useDict'
import { resetForm, addDateRange, download, parseTime } from '@/composables/useCommon'

const { proxy } = getCurrentInstance()
const { sys_common_status } = useDict('sys_common_status')

// 登录日志管理
const logininfor = reactive({
  // 响应式数据
  logininforRef: null,
  queryRef: null,
  list: [],
  loading: true,
  showSearch: true,
  ids: [],
  single: true,
  multiple: true,
  selectName: '',
  total: 0,
  dateRange: [],
  defaultSort: { prop: 'loginTime', order: 'descending' },

  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ipaddr: undefined,
    userName: undefined,
    status: undefined,
    orderByColumn: undefined,
    isAsc: undefined
  },

  // 方法集合
  // 查询登录日志列表
  getList: async () => {
    logininfor.loading = true
    try {
      const response = await list(addDateRange(logininfor.queryParams, logininfor.dateRange))
      logininfor.list = response.data.list
      logininfor.total = response.data.total
    } finally {
      logininfor.loading = false
    }
  },

  // 搜索按钮操作
  handleQuery: () => {
    logininfor.queryParams.pageNum = 1
    logininfor.getList()
  },

  // 重置按钮操作
  resetQuery: () => {
    logininfor.dateRange = []
    resetForm(logininfor.queryRef)
    logininfor.queryParams.pageNum = 1
    proxy.$refs['logininforRef'].sort(logininfor.defaultSort.prop, logininfor.defaultSort.order)
  },

  // 多选框选中数据
  handleSelectionChange: (selection) => {
    logininfor.ids = selection.map((item) => item.infoId)
    logininfor.multiple = !selection.length
    logininfor.single = selection.length !== 1
    logininfor.selectName = selection.map((item) => item.userName)
  },

  // 排序触发事件
  handleSortChange: (column) => {
    logininfor.queryParams.orderByColumn = column.prop
    logininfor.queryParams.isAsc = column.order
    logininfor.getList()
  },

  // 删除按钮操作
  handleDelete: async (row) => {
    const infoIds = row.infoId || logininfor.ids
    try {
      await proxy.$modal.confirm('是否确认删除访问编号为"' + infoIds + '"的数据项？')
      await delLogininfor(infoIds)
      proxy.$modal.msgSuccess('删除成功')
      logininfor.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('删除失败:', e)
      }
    }
  },

  // 清空按钮操作
  handleClean: async () => {
    try {
      await proxy.$modal.confirm('是否确认清空所有登录日志数据项？')
      await cleanLogininfor()
      proxy.$modal.msgSuccess('清空成功')
      logininfor.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('清空失败:', e)
      }
    }
  },

  // 解锁按钮操作
  handleUnlock: async () => {
    const username = logininfor.selectName
    try {
      await proxy.$modal.confirm('是否确认解锁用户"' + username + '"数据项？')
      await unlockLogininfor(username)
      proxy.$modal.msgSuccess('用户' + username + '解锁成功')
    } catch (e) {
      if (e !== 'cancel') {
        console.error('解锁失败:', e)
      }
    }
  },

  // 导出按钮操作
  handleExport: () => {
    download(
      'monitor/logininfor/export',
      {
        ...logininfor.queryParams
      },
      `config_${new Date().getTime()}.xlsx`
    )
  }
})

// 初始化加载
logininfor.getList()
</script>
