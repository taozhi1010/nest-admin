<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane v-if="shouldHide('second')" label="秒">
        <crontab-second ref="cronsecond" :check="checkNumber" :cron="crontab.valueObj" @update="updateCrontabValue" />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('min')" label="分钟">
        <crontab-min ref="cronmin" :check="checkNumber" :cron="crontab.valueObj" @update="updateCrontabValue" />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('hour')" label="小时">
        <crontab-hour ref="cronhour" :check="checkNumber" :cron="crontab.valueObj" @update="updateCrontabValue" />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('day')" label="日">
        <crontab-day ref="cronday" :check="checkNumber" :cron="crontab.valueObj" @update="updateCrontabValue" />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('month')" label="月">
        <crontab-month ref="cronmonth" :check="checkNumber" :cron="crontab.valueObj" @update="updateCrontabValue" />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('week')" label="周">
        <crontab-week ref="cronweek" :check="checkNumber" :cron="crontab.valueObj" @update="updateCrontabValue" />
      </el-tab-pane>

      <el-tab-pane v-if="shouldHide('year')" label="年">
        <crontab-year ref="cronyear" :check="checkNumber" :cron="crontab.valueObj" @update="updateCrontabValue" />
      </el-tab-pane>
    </el-tabs>

    <div class="popup-main">
      <div class="popup-result">
        <p class="title">时间表达式</p>
        <table>
          <thead>
            <th v-for="item of tabTitles" :key="item">{{ item }}</th>
            <th>Cron 表达式</th>
          </thead>
          <tbody>
            <td>
              <span v-if="crontab.valueObj.second.length < 10">{{ crontab.valueObj.second }}</span>
              <el-tooltip v-else :content="crontab.valueObj.second" placement="top">
                <span>{{ crontab.valueObj.second }}</span>
              </el-tooltip>
            </td>
            <td>
              <span v-if="crontab.valueObj.min.length < 10">{{ crontab.valueObj.min }}</span>
              <el-tooltip v-else :content="crontab.valueObj.min" placement="top">
                <span>{{ crontab.valueObj.min }}</span>
              </el-tooltip>
            </td>
            <td>
              <span v-if="crontab.valueObj.hour.length < 10">{{ crontab.valueObj.hour }}</span>
              <el-tooltip v-else :content="crontab.valueObj.hour" placement="top">
                <span>{{ crontab.valueObj.hour }}</span>
              </el-tooltip>
            </td>
            <td>
              <span v-if="crontab.valueObj.day.length < 10">{{ crontab.valueObj.day }}</span>
              <el-tooltip v-else :content="crontab.valueObj.day" placement="top">
                <span>{{ crontab.valueObj.day }}</span>
              </el-tooltip>
            </td>
            <td>
              <span v-if="crontab.valueObj.month.length < 10">{{ crontab.valueObj.month }}</span>
              <el-tooltip v-else :content="crontab.valueObj.month" placement="top">
                <span>{{ crontab.valueObj.month }}</span>
              </el-tooltip>
            </td>
            <td>
              <span v-if="crontab.valueObj.week.length < 10">{{ crontab.valueObj.week }}</span>
              <el-tooltip v-else :content="crontab.valueObj.week" placement="top">
                <span>{{ crontab.valueObj.week }}</span>
              </el-tooltip>
            </td>
            <td>
              <span v-if="crontab.valueObj.year.length < 10">{{ crontab.valueObj.year }}</span>
              <el-tooltip v-else :content="crontab.valueObj.year" placement="top">
                <span>{{ crontab.valueObj.year }}</span>
              </el-tooltip>
            </td>
            <td class="result">
              <span v-if="crontabValueString.length < 90">{{ crontabValueString }}</span>
              <el-tooltip v-else :content="crontabValueString" placement="top">
                <span>{{ crontabValueString }}</span>
              </el-tooltip>
            </td>
          </tbody>
        </table>
      </div>
      <crontab-result :ex="crontabValueString" />

      <div class="pop_btn">
        <el-button type="primary" @click="submitFill">确定</el-button>
        <el-button type="warning" @click="clearCron">重置</el-button>
        <el-button @click="hidePopup">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CrontabSecond from './second.vue'
import CrontabMin from './min.vue'
import CrontabHour from './hour.vue'
import CrontabDay from './day.vue'
import CrontabMonth from './month.vue'
import CrontabWeek from './week.vue'
import CrontabYear from './year.vue'
import CrontabResult from './result.vue'

// ==================== 事件与属性 ====================
const emit = defineEmits(['hide', 'fill'])
const props = defineProps({
  hideComponent: {
    type: Array as () => string[],
    default: () => []
  },
  expression: {
    type: String,
    default: ''
  }
})

// ==================== 响应式数据 ====================
const tabTitles = ref(['秒', '分钟', '小时', '日', '月', '周', '年'])
const tabActive = ref(0)
const crontab = reactive({
  hideComponent: [] as string[],
  expression: '',
  valueObj: {
    second: '*',
    min: '*',
    hour: '*',
    day: '*',
    month: '*',
    week: '?',
    year: ''
  }
})

// ==================== 计算属性 ====================
/**
 * Cron 表达式字符串
 */
const crontabValueString = computed(() => {
  const obj = crontab.valueObj
  return `${obj.second} ${obj.min} ${obj.hour} ${obj.day} ${obj.month} ${obj.week}${obj.year === '' ? '' : ` ${obj.year}`}`
})

// ==================== 监听器 ====================
watch(
  () => crontab.expression,
  () => resolveExp()
)

// ==================== 方法集合 ====================
/**
 * 判断是否应该隐藏某个标签页
 * @param {string} key - 标签页标识
 */
function shouldHide(key: string) {
  return !(crontab.hideComponent && crontab.hideComponent.includes(key))
}

/**
 * 解析 Cron 表达式
 */
function resolveExp() {
  // 反解析表达式
  if (crontab.expression) {
    const arr = crontab.expression.split(/\s+/)
    if (arr.length >= 6) {
      //6 位以上是合法表达式
      let obj = {
        second: arr[0],
        min: arr[1],
        hour: arr[2],
        day: arr[3],
        month: arr[4],
        week: arr[5],
        year: arr[6] ? arr[6] : ''
      }
      crontab.valueObj = {
        ...obj
      }
    }
  } else {
    // 没有传入的表达式 则还原
    clearCron()
  }
}

/**
 * Tab 切换事件
 * @param {number} index - 标签页索引
 */
function tabCheck(index: number) {
  tabActive.value = index
}

/**
 * 由子组件触发，更改表达式组成的字段值
 * @param {string} name - 字段名
 * @param {string} value - 字段值
 * @param {string} from - 来源组件
 */
function updateCrontabValue(name: string, value: string, from: string) {
  crontab.valueObj[name as keyof typeof crontab.valueObj] = value
}

/**
 * 表单选项的子组件校验数字格式（通过 -props 传递）
 * @param {number} value - 待校验的数值
 * @param {number} minLimit - 最小值
 * @param {number} maxLimit - 最大值
 */
function checkNumber(value: number, minLimit: number, maxLimit: number) {
  // 检查必须为整数
  value = Math.floor(value)
  if (value < minLimit) {
    value = minLimit
  } else if (value > maxLimit) {
    value = maxLimit
  }
  return value
}

/**
 * 隐藏弹窗
 */
function hidePopup() {
  emit('hide')
}

/**
 * 填充表达式
 */
function submitFill() {
  emit('fill', crontabValueString.value)
  hidePopup()
}

/**
 * 重置 Cron 表达式
 */
function clearCron() {
  // 还原选择项
  crontab.valueObj = {
    second: '*',
    min: '*',
    hour: '*',
    day: '*',
    month: '*',
    week: '?',
    year: ''
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  crontab.expression = props.expression
  crontab.hideComponent = props.hideComponent
})
</script>

<style lang="scss" scoped>
.pop_btn {
  text-align: center;
  margin-top: 20px;
}

.popup-main {
  position: relative;
  margin: 10px auto;
  background: #fff;
  border-radius: 5px;
  font-size: 12px;
  overflow: hidden;
}

.popup-title {
  overflow: hidden;
  line-height: 34px;
  padding-top: 6px;
  background: #f2f2f2;
}

.popup-result {
  box-sizing: border-box;
  line-height: 24px;
  margin: 25px auto;
  padding: 15px 10px 10px;
  border: 1px solid #ccc;
  position: relative;
}

.popup-result .title {
  position: absolute;
  top: -28px;
  left: 50%;
  width: 140px;
  font-size: 14px;
  margin-left: -70px;
  text-align: center;
  line-height: 30px;
  background: #fff;
}

.popup-result table {
  text-align: center;
  width: 100%;
  margin: 0 auto;
}

.popup-result table td:not(.result) {
  width: 3.5rem;
  min-width: 3.5rem;
  max-width: 3.5rem;
}

.popup-result table span {
  display: block;
  width: 100%;
  font-family: arial;
  line-height: 30px;
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.popup-result-scroll {
  font-size: 12px;
  line-height: 24px;
  height: 10em;
  overflow-y: auto;
}
</style>
