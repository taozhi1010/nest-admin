<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="menu.showSearch" ref="queryRef" v-no-enter :inline="true" :model="menu.queryParams">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model.trim="menu.queryParams.menuName" clearable placeholder="请输入菜单名称" style="width: 200px" @keyup.enter="menu.handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="menu.queryParams.status" clearable placeholder="菜单状态" style="width: 200px">
            <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="Search" type="primary" @click="menu.handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="menu.resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row class="mb8" :gutter="10">
        <el-col :span="1.5">
          <el-button v-hasPermi="['system:menu:add']" icon="Plus" plain type="primary" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button icon="Sort" plain type="info" @click="toggleExpandAll">展开/折叠</el-button>
        </el-col>
        <right-toolbar v-model:show-search="menu.showSearch" @query-table="menu.getList" />
      </el-row>

      <el-table v-if="refreshTable" v-loading="menu.loading" :data="menu.list" :default-expand-all="isExpandAll" row-key="menuId" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column label="菜单名称" prop="menuName" :show-overflow-tooltip="true" width="160" />
        <el-table-column align="center" label="图标" prop="icon" width="100">
          <template #default="scope">
            <svg-icon :icon-class="scope.row.icon" />
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="orderNum" width="60" />
        <el-table-column label="权限标识" prop="perms" :show-overflow-tooltip="true" />
        <el-table-column label="组件路径" prop="component" :show-overflow-tooltip="true" />
        <el-table-column label="状态" prop="status" width="80">
          <template #default="scope">
            <span>{{ getDictLabel('sys_normal_disable', scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" width="160">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" class-name="small-padding fixed-width" label="操作" width="210">
          <template #default="scope">
            <el-button v-hasPermi="['system:menu:edit']" icon="Edit" link type="primary" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button v-hasPermi="['system:menu:add']" icon="Plus" link type="primary" @click="handleAdd(scope.row)">新增</el-button>
            <el-button v-hasPermi="['system:menu:remove']" icon="Delete" link type="primary" @click="menu.handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加或修改菜单对话框 -->
      <el-dialog v-model="menu.open" append-to-body :title="menu.title" width="680px">
        <el-form ref="menuRef" v-no-enter label-width="100px" :model="menu.form" :rules="rules">
          <el-row>
            <el-col :span="24">
              <el-form-item label="上级菜单">
                <el-tree-select v-model="menu.form.parentId" check-strictly :data="menuOptions" placeholder="选择上级菜单" :props="{ value: 'menuId', label: 'menuName', children: 'children' }" value-key="menuId" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="菜单类型" prop="menuType">
                <el-radio-group v-model="menu.form.menuType">
                  <el-radio label="M">目录</el-radio>
                  <el-radio label="C">菜单</el-radio>
                  <el-radio label="F">按钮</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col v-if="menu.form.menuType != 'F'" :span="24">
              <el-form-item label="菜单图标" prop="icon">
                <el-popover v-model:visible="showChooseIcon" placement="bottom-start" trigger="click" :width="540" @show="showSelectIcon">
                  <template #reference>
                    <el-input v-model.trim="menu.form.icon" v-click-outside="hideSelectIcon" placeholder="点击选择图标" readonly @blur="showSelectIcon">
                      <template #prefix>
                        <svg-icon v-if="menu.form.icon" class="el-input__icon" :icon-class="menu.form.icon" style="height: 32px; width: 16px" />
                        <el-icon v-else style="height: 32px; width: 16px">
                          <search></search>
                        </el-icon>
                      </template>
                    </el-input>
                  </template>
                  <icon-select ref="iconSelectRef" :active-icon="menu.form.icon" @selected="selected" />
                </el-popover>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="菜单名称" prop="menuName">
                <el-input v-model.trim="menu.form.menuName" placeholder="请输入菜单名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示排序" prop="orderNum">
                <el-input-number v-model="menu.form.orderNum" controls-position="right" :min="0" />
              </el-form-item>
            </el-col>
            <el-col v-if="menu.form.menuType != 'F'" :span="12">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    是否外链
                  </span>
                </template>
                <el-radio-group v-model="menu.form.isFrame">
                  <el-radio label="0">是</el-radio>
                  <el-radio label="1">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col v-if="menu.form.menuType != 'F'" :span="12">
              <el-form-item prop="path">
                <template #label>
                  <span>
                    <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    路由地址
                  </span>
                </template>
                <el-input v-model.trim="menu.form.path" placeholder="请输入路由地址" />
              </el-form-item>
            </el-col>
            <el-col v-if="menu.form.menuType == 'C'" :span="12">
              <el-form-item prop="component">
                <template #label>
                  <span>
                    <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    组件路径
                  </span>
                </template>
                <el-input v-model.trim="menu.form.component" placeholder="请输入组件路径" />
              </el-form-item>
            </el-col>
            <el-col v-if="menu.form.menuType != 'M'" :span="12">
              <el-form-item>
                <el-input v-model.trim="menu.form.perms" maxlength="100" placeholder="请输入权限标识" />
                <template #label>
                  <span>
                    <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    权限字符
                  </span>
                </template>
              </el-form-item>
            </el-col>
            <el-col v-if="menu.form.menuType == 'C'" :span="12">
              <el-form-item>
                <el-input v-model.trim="menu.form.query" maxlength="255" placeholder="请输入路由参数" />
                <template #label>
                  <span>
                    <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    路由参数
                  </span>
                </template>
              </el-form-item>
            </el-col>
            <el-col v-if="menu.form.menuType == 'C'" :span="12">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    是否缓存
                  </span>
                </template>
                <el-radio-group v-model="menu.form.isCache">
                  <el-radio label="0">缓存</el-radio>
                  <el-radio label="1">不缓存</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col v-if="menu.form.menuType != 'F'" :span="12">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    显示状态
                  </span>
                </template>
                <el-radio-group v-model="menu.form.visible">
                  <el-radio v-for="dict in sys_show_hide" :key="dict.value" :label="dict.value">
                    {{ dict.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col v-if="menu.form.menuType != 'F'" :span="12">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    菜单状态
                  </span>
                </template>
                <el-radio-group v-model="menu.form.status">
                  <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="menu.submitForm">确 定</el-button>
            <el-button @click="menu.cancel">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup name="Menu">
import { ClickOutside as vClickOutside } from 'element-plus';

import { addMenu, delMenu, getMenu, listMenu, updateMenu } from '@/api/system/menu';
import IconSelect from '@/components/IconSelect';
import SvgIcon from '@/components/SvgIcon';
import { handleTree, parseTime } from '@/composables/useCommon';
import { useCrud } from '@/composables/useCrud';
import { useDict } from '@/composables/useDict';

const { sys_show_hide, sys_normal_disable, getDictLabel } = useDict('sys_show_hide', 'sys_normal_disable');

// 表单 ref 与页面特有状态
const queryRef = ref(null);
const menuRef = ref(null);
const iconSelectRef = ref(null);
const menuOptions = ref([]);
const showChooseIcon = ref(false);
const refreshTable = ref(true);
const isExpandAll = ref(false);

// 表单验证规则
const rules = {
  menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  orderNum: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
  path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }]
};

// 菜单管理（树形表格，后端返回全量数据无分页）
const menu = useCrud({
  api: {
    // 后端返回平铺数组，转树形后适配 useCrud 的 { data: { list } } 信封
    list: async (params) => {
      const response = await listMenu(params);
      return { data: { list: handleTree(response.data, 'menuId'), total: 0 } };
    },
    get: getMenu,
    add: addMenu,
    update: updateMenu,
    del: delMenu
  },
  idKey: 'menuId',
  name: '菜单',
  query: { menuName: undefined, visible: undefined },
  form: {
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: 'M',
    orderNum: undefined,
    isFrame: '1',
    isCache: '0',
    visible: '0',
    status: '0',
    perms: undefined,
    component: undefined,
    path: undefined,
    query: undefined
  },
  texts: {
    // 删除确认显示菜单名称而非编号
    deleteConfirm: (ids, row) => `是否确认删除名称为"${row?.menuName ?? ids}"的数据项？`
  },
  queryRef,
  formRef: menuRef
});

// 查询菜单下拉树结构
const getTreeselect = async () => {
  menuOptions.value = [];
  const response = await listMenu();
  const menuData = { menuId: 0, menuName: '主类目', children: [] };
  menuData.children = handleTree(response.data, 'menuId');
  menuOptions.value.push(menuData);
};

// 新增按钮操作：先取上级菜单下拉树，可选指定父节点（行内新增）
const baseHandleAdd = menu.handleAdd;
const handleAdd = async (row) => {
  await getTreeselect();
  baseHandleAdd(row);
  menu.form.parentId = row != null && row.menuId ? row.menuId : 0;
};

// 修改按钮操作：先取上级菜单下拉树
const baseHandleUpdate = menu.handleUpdate;
const handleUpdate = async (row) => {
  await getTreeselect();
  await baseHandleUpdate(row);
};

// 展开/折叠操作
const toggleExpandAll = () => {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
};

// 展示下拉图标
const showSelectIcon = () => {
  iconSelectRef.value.reset();
  showChooseIcon.value = true;
};

// 选择图标
const selected = (name) => {
  menu.form.icon = name;
  showChooseIcon.value = false;
};

// 图标外层点击隐藏下拉列表
const hideSelectIcon = (event) => {
  const elem = event.relatedTarget || event.srcElement || event.target || event.currentTarget;
  const className = elem.className;
  if (className !== 'el-input__inner') {
    showChooseIcon.value = false;
  }
};

// 初始化加载
menu.getList();
</script>
