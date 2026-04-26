<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1">不填，允许的通配符[, - * /]</el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2">每年</el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        周期�?
        <el-input-number v-model="cycle01" :max="maxFullYear - 1" :min="fullYear" />
        -
        <el-input-number v-model="cycle02" :max="maxFullYear" :min="cycle01 + 1" />
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="4">
        �?
        <el-input-number v-model="average01" :max="maxFullYear - 1" :min="fullYear" />
        年开始，�?
        <el-input-number v-model="average02" :max="10" :min="1" />
        年执行一�?
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="5">
        指定
        <el-select v-model="checkboxList" clearable multiple :multiple-limit="8" placeholder="可多�?>
          <el-option v-for="item in 9" :key="item" :label="item - 1 + fullYear" :value="item - 1 + fullYear" />
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
const fullYear = ref(0)
const maxFullYear = ref(0)
const radioValue = ref(1)
const cycle01 = ref(0)
const cycle02 = ref(0)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])
const checkCopy = ref([])
const cycleTotal = computed(() => {
  const checked01 = props.check(cycle01.value, fullYear.value, maxFullYear.value - 1)
  const checked02 = props.check(cycle02.value, cycle01.value + 1, maxFullYear.value)
  return `${checked01}-${checked02}`
})
const averageTotal = computed(() => {
  const checked01 = props.check(average01.value, fullYear.value, maxFullYear.value - 1)
  const checked02 = props.check(average02.value, 1, 10)
  return `${checked01}/${checked02}`
})
const checkboxString = computed(() => {
  return checkboxList.value.join(',')
})
watch(
  () => props.cron.year,
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
  if (value === '') {
    radioValue.value = 1
  } else if (value === '*') {
    radioValue.value = 2
  } else if (value.indexOf('-') > -1) {
    const indexArr = value.split('-')
    cycle01.value = Number(indexArr[0])
    cycle02.value = Number(indexArr[1])
    radioValue.value = 3
  } else if (value.indexOf('/') > -1) {
    const indexArr = value.split('#')
    average01.value = Number(indexArr[1])
    average02.value = Number(indexArr[0])
    radioValue.value = 4
  } else {
    checkboxList.value = [...new Set(value.split(',').map((item) => Number(item)))]
    radioValue.value = 5
  }
}
function onRadioChange() {
  switch (radioValue.value) {
    case 1:
      emit('update', 'year', '', 'year')
      break
    case 2:
      emit('update', 'year', '*', 'year')
      break
    case 3:
      emit('update', 'year', cycleTotal.value, 'year')
      break
    case 4:
      emit('update', 'year', averageTotal.value, 'year')
      break
    case 5:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0])
      } else {
        checkCopy.value = checkboxList.value
      }
      emit('update', 'year', checkboxString.value, 'year')
      break
  }
}
onMounted(() => {
  fullYear.value = Number(new Date().getFullYear())
  maxFullYear.value = fullYear.value + 10
  cycle01.value = fullYear.value
  cycle02.value = cycle01.value + 1
  average01.value = fullYear.value
  checkCopy.value = [fullYear.value]
})
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
