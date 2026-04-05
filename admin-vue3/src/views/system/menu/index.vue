<template>
  <div class="app-container">
    <div class="main-card">
      <el-form v-show="menu.showSearch" ref="queryRef" :inline="true" :model="menu.queryParams">
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
        <el-button v-hasPermi="['system:menu:add']" icon="Plus" plain type="primary" @click="menu.handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button icon="Sort" plain type="info" @click="menu.toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:show-search="menu.showSearch" @query-table="menu.getList" />
    </el-row>

    <el-table v-if="menu.refreshTable" v-loading="menu.loading" :data="menu.menuList" :default-expand-all="menu.isExpandAll" row-key="menuId" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      >
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
          <el-button v-hasPermi="['system:menu:edit']" icon="Edit" link type="primary" @click="menu.handleUpdate(scope.row)">修改</el-button>
          <el-button v-hasPermi="['system:menu:add']" icon="Plus" link type="primary" @click="menu.handleAdd(scope.row)">新增</el-button>
          <el-button v-hasPermi="['system:menu:remove']" icon="Delete" link type="primary" @click="menu.handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog v-model="menu.open" append-to-body :title="menu.title" width="680px">
      <el-form ref="menuRef" label-width="100px" :model="menu.form" :rules="menu.rules">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单">
              <el-tree-select v-model="menu.form.parentId" check-strictly :data="menu.menuOptions" placeholder="选择上级菜单" :props="{ value: 'menuId', label: 'menuName', children: 'children' }" value-key="menuId" />
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
              <el-popover v-model:visible="menu.showChooseIcon" placement="bottom-start" trigger="click" :width="540" @show="menu.showSelectIcon">
                <template #reference>
                  <el-input v-model.trim="menu.form.icon" v-click-outside="menu.hideSelectIcon" placeholder="点击选择图标" readonly @blur="menu.showSelectIcon">
                    <template #prefix>
                      <svg-icon v-if="menu.form.icon" class="el-input__icon" :icon-class="menu.form.icon" style="height: 32px; width: 16px" />
                      <el-icon v-else style="height: 32px; width: 16px">
                        <search></search>
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <icon-select ref="iconSelectRef" :active-icon="menu.form.icon" @selected="menu.selected" />
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
import { nextTick } from 'vue'
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from '@/api/system/menu'
import SvgIcon from '@/components/SvgIcon'
import IconSelect from '@/components/IconSelect'
import { ClickOutside as vClickOutside } from 'element-plus'
import { useDict } from '@/composables/useDict'
import { resetForm, handleTree, parseTime } from '@/composables/useCommon'

const { sys_show_hide, sys_normal_disable, getDictLabel } = useDict('sys_show_hide', 'sys_normal_disable')

// 表单 ref
const queryRef = ref(null)
const menuRef = ref(null)
const iconSelectRef = ref(null)

// 菜单管理
const menu = reactive({
  // 列表状态
  menuList: [],
  loading: true,
  showSearch: true,
  refreshTable: true,
  isExpandAll: false,
  menuOptions: [],
  showChooseIcon: false,

  // 查询参数
  queryParams: {
    menuName: undefined,
    visible: undefined
  },

  // 弹窗状态
  open: false,
  title: '',

  // 表单数据
  form: {},

  // 表单验证规则
  rules: {
    menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
    orderNum: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
    path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }]
  },

  // 方法集合
  // 查询菜单列表
  getList: () => {
    menu.loading = true
    listMenu(menu.queryParams).then((response) => {
      menu.menuList = handleTree(response.data, 'menuId')
      menu.loading = false
    })
  },

  // 查询菜单下拉树结构
  getTreeselect: async () => {
    menu.menuOptions = []
    const response = await listMenu()
    const menuData = { menuId: 0, menuName: '主类目', children: [] }
    menuData.children = handleTree(response.data, 'menuId')
    menu.menuOptions.push(menuData)
  },

  // 取消按钮
  cancel: () => {
    menu.open = false
    menu.reset()
  },

  // 表单重置
  reset: () => {
    Object.assign(menu.form, {
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
    })
    nextTick(() => {
      resetForm(menuRef.value)
    })
  },

  // 展示下拉图标
  showSelectIcon: () => {
    iconSelectRef.value.reset()
    menu.showChooseIcon = true
  },

  // 选择图标
  selected: (name) => {
    menu.form.icon = name
    menu.showChooseIcon = false
  },

  // 图标外层点击隐藏下拉列表
  hideSelectIcon: (event) => {
    const elem = event.relatedTarget || event.srcElement || event.target || event.currentTarget
    const className = elem.className
    if (className !== 'el-input__inner') {
      menu.showChooseIcon = false
    }
  },

  // 搜索按钮操作
  handleQuery: () => {
    menu.getList()
  },

  // 重置按钮操作
  resetQuery: () => {
    resetForm(queryRef.value)
    menu.handleQuery()
  },

  // 新增按钮操作
  handleAdd: async (row) => {
    await menu.getTreeselect()
    menu.reset()
    menu.form.parentId = row != null && row.menuId ? row.menuId : 0
    menu.open = true
    menu.title = '添加菜单'
  },

  // 展开/折叠操作
  toggleExpandAll: () => {
    menu.refreshTable = false
    menu.isExpandAll = !menu.isExpandAll
    nextTick(() => {
      menu.refreshTable = true
    })
  },

  // 修改按钮操作
  handleUpdate: async (row) => {
    await menu.getTreeselect()
    const response = await getMenu(row.menuId)
    Object.assign(menu.form, response.data)
    menu.open = true
    menu.title = '修改菜单'
  },

  // 提交按钮
  submitForm: () => {
    menuRef.value.validate(async (valid) => {
      if (!valid) return

      try {
        if (menu.form.menuId != undefined) {
          await updateMenu(menu.form)
          ElMessage.success('修改成功')
        } else {
          await addMenu(menu.form)
          ElMessage.success('新增成功')
        }
        menu.open = false
        menu.getList()
      } catch (e) {
        console.error('提交失败:', e)
      }
    })
  },

  // 删除按钮操作
  handleDelete: async (row) => {
    try {
      await ElMessageBox.confirm(`是否确认删除名称为"${row.menuName}"的数据项？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await delMenu(row.menuId)
      ElMessage.success('删除成功')
      menu.getList()
    } catch (e) {
      if (e !== 'cancel') {
        console.error('删除失败:', e)
      }
    }
  }
})

// 初始化加载
menu.getList()
</script>
