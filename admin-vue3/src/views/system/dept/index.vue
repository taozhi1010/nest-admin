<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="dept.showSearch" ref="queryRef" v-no-enter :inline="true" :model="dept.queryParams">
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="dept.queryParams.deptName" clearable placeholder="请输入部门名称" style="width: 200px" @keyup.enter="dept.handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dept.queryParams.status" clearable placeholder="部门状态" style="width: 200px">
            <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="dept.handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="dept.resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row class="mb8" :gutter="10">
        <el-col :span="1.5">
          <el-button v-hasPermi="['system:dept:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button icon="Sort" plain type="info" @click="toggleExpandAll">展开/折叠</el-button>
        </el-col>
        <right-toolbar v-model:show-search="dept.showSearch" @query-table="dept.getList" />
      </el-row>

      <el-table
        v-if="refreshTable"
        v-loading="dept.loading"
        :data="dept.list"
        :default-expand-all="isExpandAll"
        row-key="deptId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column label="部门名称" prop="deptName" width="260" />
        <el-table-column label="排序" prop="orderNum" width="200" />
        <el-table-column label="状态" prop="status" width="100">
          <template #default="scope">
            <span>{{ getDictLabel('sys_normal_disable', scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" width="200">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
          <template #default="scope">
            <el-button v-hasPermi="['system:dept:edit']" icon="Edit" link type="primary" @click="dept.handleUpdate(scope.row)">修改</el-button>
            <el-button v-hasPermi="['system:dept:add']" icon="Plus" link type="primary" @click="handleAdd(scope.row)">新增</el-button>
            <el-button v-if="scope.row.parentId != 0" v-hasPermi="['system:dept:remove']" icon="Delete" link type="primary" @click="dept.handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加或修改部门对话框 -->
      <el-dialog v-model="dept.open" append-to-body :title="dept.title" width="600px">
        <el-form ref="deptRef" v-no-enter label-width="80px" :model="dept.form" :rules="rules">
          <el-row>
            <el-col v-if="dept.form.parentId !== 0" :span="24">
              <el-form-item label="上级部门" prop="parentId">
                <el-tree-select
                  v-model="dept.form.parentId"
                  check-strictly
                  :data="deptOptions"
                  placeholder="选择上级部门"
                  :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                  value-key="deptId" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门名称" prop="deptName">
                <el-input v-model="dept.form.deptName" placeholder="请输入部门名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示排序" prop="orderNum">
                <el-input-number v-model="dept.form.orderNum" controls-position="right" :min="0" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="负责人" prop="leader">
                <el-input v-model="dept.form.leader" maxlength="20" placeholder="请输入负责人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="dept.form.phone" maxlength="11" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="dept.form.email" maxlength="50" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门状态">
                <el-radio-group v-model="dept.form.status">
                  <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="dept.submitForm">确 定</el-button>
            <el-button @click="dept.cancel">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup name="Dept">
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from '@/api/system/dept';
import { handleTree, parseTime } from '@/composables/useCommon';
import { useCrud } from '@/composables/useCrud';
import { useDict } from '@/composables/useDict';

const { sys_normal_disable, getDictLabel } = useDict('sys_normal_disable');

const deptOptions = ref([]);
const isExpandAll = ref(true);
const refreshTable = ref(true);
const deptRef = ref(null);
const queryRef = ref(null);

// 表单校验规则
const rules = {
  parentId: [{ required: true, message: '上级部门不能为空', trigger: 'blur' }],
  deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
  phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
};

// 部门管理（树形表格，后端返回全量数据无分页）
const dept = useCrud({
  api: {
    // 后端返回平铺数组，转树形后适配 useCrud 的 { data: { list } } 信封
    list: async (params) => {
      const response = await listDept(params);
      return { data: { list: handleTree(response.data, 'deptId'), total: 0 } };
    },
    // 详情查询：同时拉取可选择的上级部门树（排除自身防自嵌套）
    get: async (deptId) => {
      const response = await getDept(deptId);
      listDeptExcludeChild(deptId).then((res) => {
        deptOptions.value = handleTree(res.data, 'deptId');
      });
      return response;
    },
    add: addDept,
    update: updateDept,
    del: delDept
  },
  idKey: 'deptId',
  name: '部门',
  query: { deptName: undefined, status: undefined },
  form: { deptId: undefined, parentId: undefined, deptName: undefined, orderNum: 0, leader: undefined, phone: undefined, email: undefined, status: '0' },
  texts: {
    // 删除确认显示部门名称而非编号
    deleteConfirm: (ids, row) => `是否确认删除名称为"${row?.deptName ?? ids}"的数据项?`
  },
  queryRef,
  formRef: deptRef
});

// 新增按钮操作：可选指定上级部门（行内新增）
const baseHandleAdd = dept.handleAdd;
const handleAdd = async (row) => {
  baseHandleAdd();
  listDept().then((response) => {
    deptOptions.value = handleTree(response.data, 'deptId');
  });
  if (row != undefined) {
    dept.form.parentId = row.deptId;
  }
};

// 展开/折叠操作
const toggleExpandAll = () => {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
};

// 初始化加载
dept.getList();
</script>
