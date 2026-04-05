<template>
  <div class="el-tree-select">
    <el-select ref="treeSelect" v-model="valueId" :clearable="true" :filter-method="selectFilterData" :filterable="true" :placeholder="placeholder" style="width: 100%" @clear="clearHandle">
      <el-option :label="valueTitle" :value="valueId">
        <el-tree id="tree-option" ref="selectTree" :accordion="accordion" :data="options" :default-expanded-keys="defaultExpandedKey" :expand-on-click-node="false" :filter-node-method="filterNode" :node-key="objMap.value" :props="objMap" @node-click="handleNodeClick" />
      </el-option>
    </el-select>
  </div>
</template>

<script setup>
const treeSelect = ref(null)
const selectTree = ref(null)

const props = defineProps({
  /* 配置项 */
  objMap: {
    type: Object,
    default: () => {
      return {
        value: 'id', // ID字段名
        label: 'label', // 显示名称
        children: 'children' // 子级字段名
      }
    }
  },
  /* 自动收起 */
  accordion: {
    type: Boolean,
    default: () => {
      return false
    }
  },
  /**当前双向数据绑定的值 */
  value: {
    type: [String, Number],
    default: ''
  },
  /**当前的数据 */
  options: {
    type: Array,
    default: () => []
  },
  /**输入框内部的文字 */
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:value'])

const valueId = computed({
  get: () => props.value,
  set: (val) => {
    emit('update:value', val)
  }
})
const valueTitle = ref('')
const defaultExpandedKey = ref([])

function initHandle() {
  nextTick(() => {
    const selectedValue = valueId.value
    if (selectedValue !== null && typeof selectedValue !== 'undefined') {
      if (selectTree.value) {
        const node = selectTree.value.getNode(selectedValue)
        if (node) {
          valueTitle.value = node.data[props.objMap.label]
          selectTree.value.setCurrentKey(selectedValue) // 设置默认选中
          defaultExpandedKey.value = [selectedValue] // 设置默认展开
        }
      }
    } else {
      clearHandle()
    }
  })
}
function handleNodeClick(node) {
  valueTitle.value = node[props.objMap.label]
  valueId.value = node[props.objMap.value]
  defaultExpandedKey.value = []
  if (treeSelect.value) {
    treeSelect.value.blur()
  }
  selectFilterData('')
}
function selectFilterData(val) {
  if (selectTree.value) {
    selectTree.value.filter(val)
  }
}
function filterNode(value, data) {
  if (!value) return true
  return data[props.objMap['label']].indexOf(value) !== -1
}
function clearHandle() {
  valueTitle.value = ''
  valueId.value = ''
  defaultExpandedKey.value = []
  clearSelected()
}
function clearSelected() {
  const allNode = document.querySelectorAll('#tree-option .el-tree-node')
  allNode.forEach((element) => element.classList.remove('is-current'))
}

onMounted(() => {
  initHandle()
})

watch(valueId, () => {
  initHandle()
})
</script>

<style lang="scss" scoped>
@use 'sass:color';

// Element Plus primary color
$primary-color: #409EFF;

.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  padding: 0;
  background-color: #fff;
  height: auto;
}

.el-select-dropdown__item.selected {
  font-weight: normal;
}

ul li .el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
  box-sizing: border-box;
}

:deep(.el-tree-node__content:hover),
:deep(.el-tree-node__content:active),
:deep(.is-current > div:first-child),
:deep(.el-tree-node__content:focus) {
  background-color: color.mix(#fff, $primary-color, 90%);
  color: $primary-color;
}
</style>
