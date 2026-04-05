<template>
  <div class="app-container dict">
    <el-card v-loading="loading" class="dict-tree" shadow="never">
      <div class="dict-tree-header">
        <el-button v-hasPermi="['system:dict:add']" class="dict-tree-header-item add-btn" icon="el-icon-plus" size="mini" type="primary" @click="dictGroup.handleAdd">添加字典分类</el-button>
        <el-input v-model="dictGroup.query.dictName" class="dict-tree-header-item search-input" placeholder="请输入字典项筛选" style="width: 200px" />
      </div>

      <div class="dict-tree-body">
        <el-tree ref="dictGroupRef" :data="dictGroup.data" :default-expand-all="true" :default-expanded-keys="[0]" :filter-node-method="dictGroup.filterNode" :indent="10" node-key="id" :props="dictGroup.props">
          <template #default="{ node, data }">
            <span v-if="node.label !== '全部字典项'" class="custom-tree-node" @click="dictGroup.handleNodeSelect(data)">
              <span class="custom-tree-node-text" :title="node.label">{{ node.label }}</span>
              <span class="custom-tree-node-icon">
                <el-button v-hasPermi="['system:dict:edit']" icon="Edit" link :title="'编辑'" type="primary" @click.stop="dictGroup.handleUpdate(data)" />
                <el-button v-hasPermi="['system:dict:remove']" icon="Delete" link :title="'删除'" type="primary" @click.stop="dictGroup.handleDelete(data)" />
              </span>
            </span>

            <span v-else class="custom-tree-node" @click.stop="dictGroup.handleGroupSelect(data)">
              <span class="custom-tree-node-text" :title="node.label">{{ node.label }}</span>
              <span class="custom-tree-node-icon refresh-icon">
                <el-button icon="Refresh" link :title="'刷新'" type="primary" @click="dictGroup.handleRefresh" />
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </el-card>

    <el-card v-loading="loading" class="dict-table" shadow="never">
      <div v-if="dictGroup.selectNode.dictId === 0">
        <el-form ref="queryDictGroupRef" :inline="true" :model="dictGroup.query">
          <el-form-item label="字典名称" prop="menuName">
            <el-input v-model="dictGroup.query.dictName" clearable placeholder="请输入字典名称" style="width: 200px" @keyup.enter="dictGroup.handleRefresh" />
          </el-form-item>
          <el-form-item label="字典类型" prop="status">
            <el-input v-model="dictGroup.query.dictType" clearable placeholder="请输入字典类型" style="width: 200px" @keyup.enter="dictGroup.handleRefresh" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="dictGroup.query.status" clearable placeholder="请选择字典状态" style="width: 200px">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button icon="Search" type="primary" @click="dictGroup.handleRefresh">搜索</el-button>
            <el-button icon="Refresh" @click="dictGroup.handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row class="mb8" :gutter="10">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:add']" icon="Plus" plain type="primary" @click="dictGroup.handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="dictGroup.handleDelete">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:export']" icon="Download" plain type="warning" @click="dictGroup.handleExport">导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:remove']" icon="Refresh" plain type="warning" @click="dictGroup.handleRefreshCache">刷新缓存</el-button>
          </el-col>
          <right-toolbar :show-search="false" @query-table="dictGroup.handleRefresh" />
        </el-row>

        <el-table ref="dictGroupTableRef" :data="dictGroup.data[0].children" max-height="70vh" @selection-change="dictGroup.handleSelectionChange">
          <el-table-column align="center" type="selection" width="55" />
          <el-table-column align="center" label="字典编号" prop="dictId" width="100" />
          <el-table-column align="center" label="字典名称" prop="dictName" :show-overflow-tooltip="true" />
          <el-table-column align="center" label="字典类型" prop="dictType" :show-overflow-tooltip="true" />
          <el-table-column align="center" label="状态" prop="status">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="备注" prop="remark" :show-overflow-tooltip="true" />
          <el-table-column align="center" label="创建时间" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" fixed="right" label="操作" width="160">
            <template #default="scope">
              <el-button v-hasPermi="['system:dict:edit']" icon="Edit" link type="primary" @click="dictGroup.handleUpdate(scope.row)">修改</el-button>
              <el-button v-hasPermi="['system:dict:remove']" icon="Delete" link type="primary" @click="dictGroup.handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-else>
        <el-descriptions border :column="4">
          <el-descriptions-item label="字典项">{{ dictGroup.selectNode.dictName }}</el-descriptions-item>
          <el-descriptions-item label="字典编号">{{ dictGroup.selectNode.dictType }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <dict-tag :options="sys_normal_disable" :value="dictGroup.selectNode.status" />
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">数据字典详情</el-divider>

        <el-row class="mb8" :gutter="10">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:add']" icon="Plus" plain type="primary" @click="dictData.handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:remove']" :disabled="multiple" icon="Delete" plain type="danger" @click="dictData.handleDelete">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:export']" icon="Download" plain type="warning" @click="dictData.handleExport">导出</el-button>
          </el-col>
          <right-toolbar :show-search="false" @query-table="dictData.handleRefresh" />
        </el-row>

        <el-table ref="dictDataRef" :data="dictData.data" @selection-change="dictData.handleSelectionChange">
          <el-table-column align="center" type="selection" width="55" />
          <el-table-column align="center" label="字典编码" prop="dictCode" />
          <el-table-column align="center" label="字典标签" prop="dictLabel">
            <template #default="scope">
              <span v-if="scope.row.listClass == '' || scope.row.listClass == 'default'">{{ scope.row.dictLabel }}</span>
              <el-tag v-else :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass">{{ scope.row.dictLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="字典键值" prop="dictValue" />
          <el-table-column align="center" label="字典排序" prop="dictSort" />
          <el-table-column align="center" label="状态" prop="status">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="备注" prop="remark" :show-overflow-tooltip="true" />
          <el-table-column align="center" label="创建时间" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" fixed="right" label="操作" width="160">
            <template #default="scope">
              <el-button v-hasPermi="['system:dict:edit']" icon="Edit" link type="primary" @click="dictData.handleUpdate(scope.row)">修改</el-button>
              <el-button v-hasPermi="['system:dict:remove']" icon="Delete" link type="primary" @click="dictData.handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>

  <dict-group-edit ref="dictGroupEditRef" @refresh="dictGroup.handleRefresh" />
  <dict-data-edit ref="dictDataEditRef" @refresh="dictData.handleRefresh" />
</template>

<script setup name="Dict">
import dictGroupEdit from './components/dictGroupEdit'
import dictDataEdit from './components/dictDataEdit'
import { listType, delType, refreshCache } from '@/api/system/dict/type'
import { listData, delData } from '@/api/system/dict/data'
import { useDict } from '@/composables/useDict'
import { resetForm, download, parseTime } from '@/composables/useCommon'

const { sys_normal_disable } = useDict('sys_normal_disable')

// 字典组树和列表的ref
const dictGroupRef = ref()
const dictGroupTableRef = ref()

// 字典内容列表ref
const dictDataRef = ref()

// 字典组和字典内容弹窗ref
const dictGroupEditRef = ref()
const dictDataEditRef = ref()
// 页面loading效果
const loading = ref(false)

// 字典组
const dictGroup = reactive({
  query: {
    pageNum: 1,
    pageSize: 9999,
    dictName: '',
    dictType: '',
    status: ''
  },
  data: [
    {
      dictId: 0,
      dictName: '全部字典项',
      children: []
    }
  ],
  selectNode: {
    dictId: 0,
    dictName: '全部字典项'
  },
  selection: [],
  props: { label: 'dictName', children: 'children' },
  request: async () => {
    loading.value = true
    try {
      const result = await listType(dictGroup.query)
      dictGroup.data[0].children = result.data.list
    } catch (e) {
      console.log('dictGroup:', e)
    } finally {
      loading.value = false
    }
  },
  handleAdd: () => {
    dictGroupEditRef.value.handleDialogOpen('add')
  },
  handleUpdate: (row) => {
    dictGroupEditRef.value.handleDialogOpen('edit', row)
  },
  handleDelete: (row) => {
    const dictIds = row.dictId || dictGroup.selection.map((item) => item.dictId).join(',')
    ElMessageBox.confirm(`是否确认删除字典编号为"${dictIds}"的数据项？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        loading.value = true
        return delType(dictIds)
      })
      .then(() => {
        dictGroup.request()
        ElMessage.success('删除成功')
      })
  },
  handleExport: () => {
    download(
      'system/dict/type/export',
      {
        ...dictGroup.query
      },
      `dict_${new Date().getTime()}.xlsx`
    )
  },
  handleRefresh: () => {
    dictGroup.request()
  },
  handleReset: () => {
    resetForm(queryDictGroupRef)
    dictGroup.request()
  },
  handleNodeSelect: (data) => {
    dictGroup.selectNode = data
    if (data.dictId !== 0) {
      dictData.request()
    }
  },
  handleGroupSelect: (data) => {
    dictGroup.selectNode.dictId = data.dictId
    dictGroup.request()
  },
  handleSelectionChange: (val) => {
    dictGroup.selection = val
  },
  filterNode: (value, data) => {
    if (!value) return true
    return data.dictName.includes(value)
  },
  handleRefreshCache: () => {
    loading.value = true
    refreshCache()
      .then(() => {
        ElMessage.success('刷新成功')
        useDictStore().cleanDict()
      })
      .finally(() => {
        loading.value = false
      })
  }
})

// 字典内容
const dictData = reactive({
  query: {
    pageNum: 1,
    pageSize: 9999,
    dictName: undefined,
    dictType: undefined,
    status: undefined
  },
  data: [],
  selection: [],
  request: () => {
    loading.value = true
    dictData.query.dictType = dictGroup.selectNode.dictType
    listData(dictData.query).then((res) => {
      dictData.data = res.data.list
      loading.value = false
    })
  },
  handleAdd: () => {
    dictDataEditRef.value.handleDialogOpen('add', dictGroup.selectNode)
  },
  handleUpdate: (row) => {
    dictDataEditRef.value.handleDialogOpen('edit', dictGroup.selectNode, row)
  },
  handleDelete: (row) => {
    const dictCodes = row.dictCode || dictData.selection.map((item) => item.dictCode).join(',')
    ElMessageBox.confirm(`是否确认删除字典编码为"${dictCodes}"的数据项？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        return delData(dictCodes)
      })
      .then(() => {
        dictData.request()
        ElMessage.success('删除成功')
        useDictStore().removeDict(dictData.query.dictType)
      })
  },
  handleExport: () => {
    download(
      'system/dict/data/export',
      {
        ...dictData.query
      },
      `dict_data_${new Date().getTime()}.xlsx`
    )
  },
  handleRefresh: () => {
    dictData.request()
  },
  handleSelectionChange: (selection) => {
    dictData.selection = selection
  }
})

watch(dictGroup.query, (val) => {
  dictGroupRef.value.filter(val.dictName)
})

dictGroup.request()
</script>

<style lang="scss" scoped>
.dict {
  width: 100%;
  height: 100%;
  display: flex;

  &-tree {
    background-color: #ffffff;
    width: 250px;
    height: calc(100vh - 200px);
    margin-right: 20px;

    &-header {
      &-item {
        width: 100%;
        margin-bottom: 10px;
      }

      .add-btn {
        width: 100%;
        margin-bottom: 8px;
      }

      .search-input {
        width: 100%;
        margin-bottom: 10px;
      }
    }

    &-body {
      height: calc(100vh - 320px);
      padding-right: 20px;
      overflow-y: scroll;
    }
  }

  &-table {
    position: relative;
    width: calc(100% - 250px);
    height: calc(100vh - 200px);
  }
}

.custom-tree-node {
  width: 200px;
  margin: 10px 0;

  &-text {
    display: inline-block;
    width: 85px !important;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &-icon {
    float: right;
  }

  .refresh-icon {
    text-align: center;
  }
}
</style>
