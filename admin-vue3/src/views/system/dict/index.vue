<template>
  <div class="app-container dict">
    <el-card class="dict-tree" shadow="never">
      <el-button type="primary" size="mini" icon="el-icon-plus" class="add-btn" @click="dictTree.handleAdd">添加字典分类</el-button>
      <el-input v-model="dictTree.query.dictName" style="width: 200px" placeholder="请输入字典项筛选" class="search-input" />
      <el-tree
        ref="treeRef"
        v-loading="dictTree.loading"
        :data="dictTree.data"
        node-key="id"
        :default-expanded-keys="[0]"
        :default-expand-all="true"
        :indent="10"
        :props="dictTree.props"
        :filter-node-method="dictTree.filterNode"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span v-if="node.label !== '全部字典项'" class="custom-tree-node-icon">
              <el-button link type="primary" :title="'编辑'" icon="Edit" @click="dictTree.handleUpdate(data)" v-hasPermi="['system:dict:edit']" />
              <el-button link type="primary" :title="'删除'" icon="Delete" @click.prevent="dictTree.handleDelete(data)" v-hasPermi="['system:dict:remove']" />
            </span>
            <span v-else class="custom-tree-node-icon refresh-icon">
              <el-button link type="primary" :title="'刷新'" icon="Refresh" @click="dictTree.handleRefresh" />
            </span>
          </span>
        </template>
      </el-tree>
    </el-card>

    <el-card class="dict-table" shadow="never"></el-card>
  </div>

  <dictGroup ref="dictGroupRef" @refresh="dictTree.handleRefresh" />
</template>

<script setup name="Dict">
import dictGroup from './components/dictGroup'
import { listType, delType } from '@/api/system/dict/type'

const treeRef = ref()
const dictGroupRef = ref()
const { proxy } = getCurrentInstance()

const dictTree = reactive({
  query: {
    pageNum: 1,
    pageSize: 99,
    dictName: '',
    dictType: undefined,
    status: undefined
  },
  data: [
    {
      dictId: 0,
      dictName: '全部字典项',
      children: []
    }
  ],
  props: { label: 'dictName', children: 'children' },
  loading: true,
  request: async () => {
    dictTree.loading = true
    try {
      const result = await listType(dictTree.query)
      dictTree.data[0].children = result.data.list
      // total.value = result.data.total
    } catch (e) {
      console.log('dictGroup:', e)
    } finally {
      dictTree.loading = false
    }
  },
  handleAdd: () => {
    dictGroupRef.value.handleDialogOpen('add')
  },
  handleUpdate: (row) => {
    dictGroupRef.value.handleDialogOpen('edit', row)
  },
  handleDelete(row) {
    const dictIds = row.dictId

    proxy.$modal
      .confirm('是否确认删除字典编号为"' + dictIds + '"的数据项？')
      .then(() => {
        dictTree.loading = true
        return delType(dictIds)
      })
      .then(() => {
        dictTree.request()
        proxy.$modal.msgSuccess('删除成功')
      })
  },
  handleRefresh: () => {
    dictTree.request()
  },
  filterNode: (value, data) => {
    if (!value) return true
    return data.dictName.includes(value)
  }
})

watch(dictTree.query, (val) => {
  treeRef.value.filter(val.dictName)
})

dictTree.request()
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

    .add-btn {
      width: 100%;
      margin-bottom: 10px;
    }

    .search-input {
      width: 100%;
      margin-bottom: 10px;
    }
  }

  &-table {
    position: relative;
    width: calc(100% - 250px);
  }
}

.custom-tree-node {
  width: 200px;
  &-icon {
    float: right;
  }

  .refresh-icon {
    text-align: center;
  }
}
</style>
