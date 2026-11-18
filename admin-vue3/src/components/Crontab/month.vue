<template>
  <el-form size="small">
    <el-form-item>
      <el-radio v-model="radioValue" :label="1">月，允许的通配符[, - * /]</el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="2">
        周期
        <el-input-number v-model="cycle01" :max="11" :min="1" />
        -
        <el-input-number v-model="cycle02" :max="12" :min="cycle01 + 1" />
        月
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="3">
        从
        <el-input-number v-model="average01" :max="11" :min="1" />
        月开始，每
        <el-input-number v-model="average02" :max="12 - average01" :min="1" />
        月执行一次
      </el-radio>
    </el-form-item>

    <el-form-item>
      <el-radio v-model="radioValue" :label="4">
        指定
        <el-select v-model="checkboxList" clearable multiple :multiple-limit="8" placeholder="可多选">
          <el-option v-for="item in 12" :key="item" :label="item" :value="item" />
        </el-select>
      </el-radio>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
const emit = defineEmits(['update']);
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
});
const radioValue = ref(1);
const cycle01 = ref(1);
const cycle02 = ref(2);
const average01 = ref(1);
const average02 = ref(1);
const checkboxList = ref([]);
const checkCopy = ref([1]);
const cycleTotal = computed(() => {
  const checked01 = props.check(cycle01.value, 1, 11);
  const checked02 = props.check(cycle02.value, cycle01.value + 1, 12);
  return `${checked01}-${checked02}`;
});
const averageTotal = computed(() => {
  const checked01 = props.check(average01.value, 1, 11);
  const checked02 = props.check(average02.value, 1, 12 - average01.value);
  return `${checked01}/${checked02}`;
});
const checkboxString = computed(() => {
  return checkboxList.value.join(',');
});
watch(
  () => props.cron.month,
  (value) => changeRadioValue(value)
);
// 监听 computed 值变化并同步�?ref
watch(cycleTotal, (value) => {
  const [v1, v2] = value.split('-');
  cycle01.value = Number(v1);
  cycle02.value = Number(v2);
});
watch(averageTotal, (value) => {
  const [v1, v2] = value.split('/');
  average01.value = Number(v1);
  average02.value = Number(v2);
});
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange());
function changeRadioValue(value) {
  if (value === '*') {
    radioValue.value = 1;
  } else if (value.indexOf('-') > -1) {
    const indexArr = value.split('-');
    cycle01.value = Number(indexArr[0]);
    cycle02.value = Number(indexArr[1]);
    radioValue.value = 2;
  } else if (value.indexOf('/') > -1) {
    const indexArr = value.split('/');
    average01.value = Number(indexArr[0]);
    average02.value = Number(indexArr[1]);
    radioValue.value = 3;
  } else {
    checkboxList.value = [...new Set(value.split(',').map((item) => Number(item)))];
    radioValue.value = 4;
  }
}
function onRadioChange() {
  switch (radioValue.value) {
    case 1:
      emit('update', 'month', '*', 'month');
      break;
    case 2:
      emit('update', 'month', cycleTotal.value, 'month');
      break;
    case 3:
      emit('update', 'month', averageTotal.value, 'month');
      break;
    case 4:
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0]);
      } else {
        checkCopy.value = checkboxList.value;
      }
      emit('update', 'month', checkboxString.value, 'month');
      break;
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
