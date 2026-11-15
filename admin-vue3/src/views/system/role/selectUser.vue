<template>
  <!-- 授权用户 -->
  <el-dialog v-model="visible" append-to-body title="选择用户" top="5vh" width="800px">
    <el-form ref="queryRef" v-no-enter :inline="true" :model="selectUser.queryParams">
      <el-form-item label="用户账号" prop="userName">
        <el-input v-model.trim="selectUser.queryParams.userName" clearable placeholder="请输入用户账号" style="width: 200px" @keyup.enter="selectUser.handleQuery" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input v-model.trim="selectUser.queryParams.phonenumber" clearable placeholder="请输入手机号码" style="width: 200px" @keyup.enter="selectUser.handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="selectUser.handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="selectUser.resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table ref="refTable" :data="selectUser.list" height="260px" @row-click="clickRow" @selection-change="selectUser.handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户账号" prop="userName" :show-overflow-tooltip="true" />
        <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
        <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
        <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
        <el-table-column align="center" label="状态" prop="status">
          <template #default="scope">
            <span>{{ getDictLabel('sys_normal_disable', scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="selectUser.total > 0"
        v-model:limit="selectUser.queryParams.pageSize"
        v-model:page="selectUser.queryParams.pageNum"
        :total="selectUser.total"
        @pagination="selectUser.getList" />
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSelectUser">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="SelectUser">
// ==================== 导入区域 ====================
import { authUserSelectAll, unallocatedUserList } from '@/api/system/role';
import { parseTime } from '@/composables/useCommon';
import { useCrud } from '@/composables/useCrud';
import { useDict } from '@/composables/useDict';

// ==================== Props 和 Emits ====================
const props = defineProps({
  roleId: {
    type: [Number, String]
  }
});

const emit = defineEmits(['ok']);

// ==================== 实例和字典 ====================
const { getDictLabel } = useDict('sys_normal_disable');

// ==================== 表单引用 ====================
const refTable = ref(null);
const queryRef = ref(null);

// ==================== 选择用户列表（CRUD 状态机，仅列表） ====================
const selectUser = useCrud({
  api: { list: unallocatedUserList },
  idKey: 'userId',
  name: '用户',
  // roleId 由 show() 注入，不参与查询重置
  query: { userName: undefined, phonenumber: undefined },
  queryRef
});

// 弹框显示状态
const visible = ref(false);

// 选择行
const clickRow = (row) => {
  refTable.value.toggleRowSelection(row);
};

// 选择授权用户操作
const handleSelectUser = async () => {
  const roleId = selectUser.queryParams.roleId;
  const uIds = selectUser.ids.join(',');

  if (uIds == '') {
    ElMessage.error('请选择要分配的用户');
    return;
  }

  try {
    const response = await authUserSelectAll({ roleId: +roleId, userIds: uIds });
    ElMessage.success(response.msg);
    if (response.code === 200) {
      visible.value = false;
      emit('ok');
    }
  } catch (e) {
    console.error('分配用户失败:', e);
  }
};

// 显示弹框
const show = () => {
  selectUser.queryParams.roleId = props.roleId;
  selectUser.getList();
  visible.value = true;
};

// ==================== 暴露方法 ====================
defineExpose({
  show
});
</script>
