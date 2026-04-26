<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1">分钟，允许的通配符[, - * /]</el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2">
        周期�?
        <el-input-number v-model="cycle01" :max="58" :min="0" />
        -
        <el-input-number v-model="cycle02" :max="59" :min="cycle01 + 1" />
        分钟
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        �?
        <el-input-number v-model="average01" :max="58" :min="0" />
        分钟开始， �?
        <el-input-number v-model="average02" :max="59 - average01" :min="1" />
        分钟执行一�?
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="4">
        指定
        <el-select v-model="checkboxList" clearable multiple :multiple-limit="10" placeholder="可多�?>
          <el-option v-for="item in 60" :key="item" :label="item - 1" :value="item - 1" />
        </el-select>
      </el-radio>
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
const emit = defineEmits(['update'])
const props = defineProps({
  cron: {
    type: Object,
    default: () => ({
      second: '*',
      min: '*',
      hour: '*',
      day: '*',
      month: '*',
      week: '?',
      year: ''
    })
  },
  check: {
    type: Function,
    default: () => {}
  }
})
const radioValue = ref(1)
const cycle01 = ref(0)
const cycle02 = ref(1)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])
const checkCopy = ref([0])
const cycleTotal = computed(() => {
  const checked01 = props.check(cycle01.value, 0, 58)
  const checked02 = props.check(cycle02.value, cycle01.value + 1, 59)
  return `${checked01}-${checked02}`
})
const averageTotal = computed(() => {
  const checked01 = props.check(average01.value, 0, 58)
  const checked02 = props.check(average02.value, 1, 59 - average01.value)
  return `${checked01}/${checked02}`
})
const checkboxString = computed(() => {
  return checkboxList.value.join(',')
})
watch(
  () => props.cron.min,
  (value) => changeRadioValue(value)
)
// 监听 computed 值变化并同步�?ref
watch(cycleTotal, (value) => {
  const [v1, v2] = value.split('-')
  cycle01.value = Number(v1)
  cycle02.value = Number(v2)
})
watch(averageTotal, (value) => {
  const [v1, v2] = value.split('/')
  average01.value = Number(v1)
  average02.value = Number(v2)
})
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange())
function changeRadioValue(value) {
  if (value === '*') {
    radioValue.value = 1
  } else if (value.indexOf('-') > -1) {
    const indexArr = value.split('-')
    cycle01.value = Number(indexArr[0])
    cycle02.value = Number(indexArr[1])
    radioValue.value = 2
  } else if (value.indexOf('/') > -1) {
    const indexArr = value.split('/')
    average01.value = Number(indexArr[0])
    average02.value = Number(indexArr[1])
    radioValue.value = 3
  } else {
    checkboxList.value = [...new Set(value.split(',').map((item) => Number(item)))]
    radioValue.value = 4
  }
}
function onRadioChange() {
  switch (radioValue.value) {
    case 1:
      emit('update', 'min', '*', 'min')
      break
    case 2:
      emit('update', 'min', cycleTotal.value, 'min')
      break
    case 3:
      emit('update', 'min', averageTotal.value, 'min')
      break
    case 4:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0])
      } else {
        checkCopy.value = checkboxList.value
      }
      emit('update', 'min', checkboxString.value, 'min')
      break
  }
}
</script>

<style lang="scss" scoped>
.el-input-number--small,
.el-select,
.el-select--small {
  margin: 0 0.2rem;
}

.el-select,
.el-select--small {
  width: 19.8rem;
}
</style>
