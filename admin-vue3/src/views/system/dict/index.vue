<template>
  <div class="app-container dict">
    <el-card v-loading="loading" class="dict-tree" shadow="never">
      <div class="dict-tree-header">
        <el-button v-hasPermi="['system:dict:add']" type="primary" size="mini" icon="el-icon-plus" class="dict-tree-header-item add-btn" @click="dictGroup.handleAdd">添加字典分类</el-button>
        <el-input v-model="dictGroup.query.dictName" style="width: 200px" placeholder="请输入字典项筛选" class="dict-tree-header-item search-input" />
      </div>

      <div class="dict-tree-body">
        <el-tree
          ref="dictGroupRef"
          :data="dictGroup.data"
          node-key="id"
          :default-expanded-keys="[0]"
          :default-expand-all="true"
          :indent="10"
          :props="dictGroup.props"
          :filter-node-method="dictGroup.filterNode"
        >
          <template #default="{ node, data }">
            <span v-if="node.label !== '全部字典项'" class="custom-tree-node" @click="dictGroup.handleNodeSelect(data)">
              <span class="custom-tree-node-text" :title="node.label">{{ node.label }}</span>
              <span class="custom-tree-node-icon">
                <el-button v-hasPermi="['system:dict:edit']" link type="primary" :title="'编辑'" icon="Edit" @click.stop="dictGroup.handleUpdate(data)" />
                <el-button v-hasPermi="['system:dict:remove']" link type="primary" :title="'删除'" icon="Delete" @click.stop="dictGroup.handleDelete(data)" />
              </span>
            </span>

            <span v-else class="custom-tree-node" @click.stop="dictGroup.handleGroupSelect(data)">
              <span class="custom-tree-node-text" :title="node.label">{{ node.label }}</span>
              <span class="custom-tree-node-icon refresh-icon">
                <el-button link type="primary" :title="'刷新'" icon="Refresh" @click="dictGroup.handleRefresh" />
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </el-card>

    <el-card v-loading="loading" class="dict-table" shadow="never">
      <div v-if="dictGroup.selectNode.dictId === 0">
        <el-form :model="dictGroup.query" ref="queryDictGroupRef" :inline="true">
          <el-form-item label="字典名称" prop="menuName">
            <el-input v-model="dictGroup.query.dictName" placeholder="请输入字典名称" clearable style="width: 200px" @keyup.enter="dictGroup.handleRefresh" />
          </el-form-item>
          <el-form-item label="字典类型" prop="status">
            <el-input v-model="dictGroup.query.dictType" placeholder="请输入字典类型" clearable style="width: 200px" @keyup.enter="dictGroup.handleRefresh" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="dictGroup.query.status" placeholder="请选择字典状态" clearable style="width: 200px">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="dictGroup.handleRefresh">搜索</el-button>
            <el-button icon="Refresh" @click="dictGroup.handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:add']" type="primary" plain icon="Plus" @click="dictGroup.handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="dictGroup.handleDelete">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:export']" type="warning" plain icon="Download" @click="dictGroup.handleExport">导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:remove']" type="warning" plain icon="Refresh" @click="dictGroup.handleRefreshCache">刷新缓存</el-button>
          </el-col>
          <right-toolbar :show-search="false" @queryTable="dictGroup.handleRefresh" />
        </el-row>

        <el-table ref="dictGroupTableRef" :data="dictGroup.data[0].children" max-height="70vh" @selection-change="dictGroup.handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="字典编号" align="center" prop="dictId" width="100" />
          <el-table-column label="字典名称" align="center" prop="dictName" :show-overflow-tooltip="true" />
          <el-table-column label="字典类型" align="center" prop="dictType" :show-overflow-tooltip="true" />
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" fixed="right">
            <template #default="scope">
              <el-button v-hasPermi="['system:dict:edit']" link type="primary" icon="Edit" @click="dictGroup.handleUpdate(scope.row)">修改</el-button>
              <el-button v-hasPermi="['system:dict:remove']" link type="primary" icon="Delete" @click="dictGroup.handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-else>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="字典项">{{ dictGroup.selectNode.dictName }}</el-descriptions-item>
          <el-descriptions-item label="字典编号">{{ dictGroup.selectNode.dictType }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <dict-tag :options="sys_normal_disable" :value="dictGroup.selectNode.status" />
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">数据字典详情</el-divider>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:add']" type="primary" plain icon="Plus" @click="dictData.handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="dictData.handleDelete">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['system:dict:export']" type="warning" plain icon="Download" @click="dictData.handleExport">导出</el-button>
          </el-col>
          <right-toolbar :show-search="false" @queryTable="dictData.handleRefresh" />
        </el-row>

        <el-table ref="dictDataRef" :data="dictData.data" @selection-change="dictData.handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="字典编码" align="center" prop="dictCode" />
          <el-table-column label="字典标签" align="center" prop="dictLabel">
            <template #default="scope">
              <span v-if="scope.row.listClass == '' || scope.row.listClass == 'default'">{{ scope.row.dictLabel }}</span>
              <el-tag v-else :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass">{{ scope.row.dictLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="字典键值" align="center" prop="dictValue" />
          <el-table-column label="字典排序" align="center" prop="dictSort" />
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
              <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="160" fixed="right">
            <template #default="scope">
              <el-button v-hasPermi="['system:dict:edit']" link type="primary" icon="Edit" @click="dictData.handleUpdate(scope.row)">修改</el-button>
              <el-button v-hasPermi="['system:dict:remove']" link type="primary" icon="Delete" @click="dictData.handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>

  <dictGroupEdit ref="dictGroupEditRef" @refresh="dictGroup.handleRefresh" />
  <dictDataEdit ref="dictDataEditRef" @refresh="dictData.handleRefresh" />
</template>

<script setup name="Dict">
import dictGroupEdit from './components/dictGroupEdit'
import dictDataEdit from './components/dictDataEdit'
import { listType, delType, refreshCache } from '@/api/system/dict/type'
import { listData, delData } from '@/api/system/dict/data'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

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
    proxy.$modal
      .confirm('是否确认删除字典编号为"' + dictIds + '"的数据项？')
      .then(() => {
        loading.value = true
        return delType(dictIds)
      })
      .then(() => {
        dictGroup.request()
        proxy.$modal.msgSuccess('删除成功')
      })
  },
  handleExport: () => {
    proxy.download(
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
    proxy.resetForm('queryDictGroupRef')
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
        proxy.$modal.msgSuccess('刷新成功')
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
    proxy.$modal
      .confirm('是否确认删除字典编码为"' + dictCodes + '"的数据项？')
      .then(() => {
        return delData(dictCodes)
      })
      .then(() => {
        dictData.request()
        proxy.$modal.msgSuccess('删除成功')
        useDictStore().removeDict(dictData.query.dictType)
      })
  },
  handleExport: () => {
    proxy.download(
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
