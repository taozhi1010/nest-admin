<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1">日，允许的通配符[, - * ? / L W]</el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2">不指�?/el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        周期�?
        <el-input-number v-model="cycle01" :max="30" :min="1" />
        -
        <el-input-number v-model="cycle02" :max="31" :min="cycle01 + 1" />
        �?
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="4">
        �?
        <el-input-number v-model="average01" :max="30" :min="1" />
        号开始，�?
        <el-input-number v-model="average02" :max="31 - average01" :min="1" />
        日执行一�?
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="5">
        每月
        <el-input-number v-model="workday" :max="31" :min="1" />
        号最近的那个工作�?
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="6">本月最后一�?/el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="7">
        指定
        <el-select v-model="checkboxList" clearable multiple :multiple-limit="10" placeholder="可多�?>
          <el-option v-for="item in 31" :key="item" :label="item" :value="item" />
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
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(1)
const average02 = ref(1)
const workday = ref(1)
const checkboxList = ref([])
const checkCopy = ref([1])
const cycleTotal = computed(() => {
  const checked01 = props.check(cycle01.value, 1, 30)
  const checked02 = props.check(cycle02.value, cycle01.value + 1, 31)
  return `${checked01}-${checked02}`
})
const averageTotal = computed(() => {
  const checked01 = props.check(average01.value, 1, 30)
  const checked02 = props.check(average02.value, 1, 31 - average01.value)
  return `${checked01}/${checked02}`
})
const workdayTotal = computed(() => {
  const checkedWorkday = props.check(workday.value, 1, 31)
  return `${checkedWorkday}W`
})
const checkboxString = computed(() => {
  return checkboxList.value.join(',')
})
watch(
  () => props.cron.day,
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
watch(workdayTotal, (value) => {
  workday.value = Number(value.replace('W', ''))
})
watch([radioValue, cycleTotal, averageTotal, workdayTotal, checkboxString], () => onRadioChange())
function changeRadioValue(value) {
  if (value === '*') {
    radioValue.value = 1
  } else if (value === '?') {
    radioValue.value = 2
  } else if (value.indexOf('-') > -1) {
    const indexArr = value.split('-')
    cycle01.value = Number(indexArr[0])
    cycle02.value = Number(indexArr[1])
    radioValue.value = 3
  } else if (value.indexOf('/') > -1) {
    const indexArr = value.split('/')
    average01.value = Number(indexArr[0])
    average02.value = Number(indexArr[1])
    radioValue.value = 4
  } else if (value.indexOf('W') > -1) {
    const indexArr = value.split('W')
    workday.value = Number(indexArr[0])
    radioValue.value = 5
  } else if (value === 'L') {
    radioValue.value = 6
  } else {
    checkboxList.value = [...new Set(value.split(',').map((item) => Number(item)))]
    radioValue.value = 7
  }
}
// 单选按钮值变化时
function onRadioChange() {
  if (radioValue.value === 2 && props.cron.week === '?') {
    emit('update', 'week', '*', 'day')
  }
  if (radioValue.value !== 2 && props.cron.week !== '?') {
    emit('update', 'week', '?', 'day')
  }
  switch (radioValue.value) {
    case 1:
      emit('update', 'day', '*', 'day')
      break
    case 2:
      emit('update', 'day', '?', 'day')
      break
    case 3:
      emit('update', 'day', cycleTotal.value, 'day')
      break
    case 4:
      emit('update', 'day', averageTotal.value, 'day')
      break
    case 5:
      emit('update', 'day', workdayTotal.value, 'day')
      break
    case 6:
      emit('update', 'day', 'L', 'day')
      break
    case 7:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0])
      } else {
        checkCopy.value = checkboxList.value
      }
      emit('update', 'day', checkboxString.value, 'day')
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
  width: 18.8rem;
}
</style>
