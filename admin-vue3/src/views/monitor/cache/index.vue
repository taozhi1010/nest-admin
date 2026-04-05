<template>
  <div class="app-container">
    <el-row>
      <el-col class="card-box" :span="24">
        <el-card>
          <template #header>
            <monitor style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">基本信息</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Redis版本</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.redis_version }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">运行模式</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.redis_mode == 'standalone' ? '单机' : '集群' }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">端口</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.tcp_port }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">客户端数</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.connected_clients }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">运行时间(天)</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.uptime_in_days }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">使用内存</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.used_memory_human }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">使用CPU</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">内存配置</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.maxmemory_human }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">AOF是否开启</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.aof_enabled == '0' ? '否' : '是' }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">RDB是否成功</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.rdb_last_bgsave_status }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">Key数量</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.dbSize" class="cell">{{ cache.dbSize }}</div>
                  </td>
                  <td class="el-table__cell is-leaf"><div class="cell">网络入口/出口</div></td>
                  <td class="el-table__cell is-leaf">
                    <div v-if="cache.info" class="cell">{{ cache.info.instantaneous_input_kbps }}kps/{{ cache.info.instantaneous_output_kbps }}kps</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col class="card-box" :span="12">
        <el-card>
          <template #header>
            <pie-chart style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">命令统计</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="commandstats" style="height: 420px"></div>
          </div>
        </el-card>
      </el-col>

      <el-col class="card-box" :span="12">
        <el-card>
          <template #header>
            <odometer style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">内存信息</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="usedmemory" style="height: 420px"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Cache">
import { getCurrentInstance, ref, onUnmounted } from 'vue'
import { getCache } from '@/api/monitor/cache'
import * as echarts from 'echarts'

const cache = ref([])
const commandstats = ref(null)
const usedmemory = ref(null)
let loadingInstance = null
let commandstatsChart = null
let usedmemoryChart = null

// 解析内存值（如 "1.23M" -> 1.23, "456K" -> 0.456）
function parseMemoryValue(memoryStr) {
  if (!memoryStr) return 0
  const match = memoryStr.match(/([\d.]+)\s*([KMGT]?B?)/i)
  if (!match) return parseFloat(memoryStr) || 0
  
  const value = parseFloat(match[1])
  const unit = match[2].toUpperCase()
  
  switch (unit) {
    case 'KB':
    case 'K':
      return value / 1024
    case 'MB':
    case 'M':
      return value
    case 'GB':
    case 'G':
      return value * 1024
    case 'TB':
    case 'T':
      return value * 1024 * 1024
    default:
      return value
  }
}

function getList() {
  loadingInstance = ElLoading.service({
    lock: true,
    text: '正在加载缓存监控数据，请稍候！',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  getCache().then((response) => {
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
    cache.value = response.data

    // 销毁旧图表实例
    if (commandstatsChart) {
      commandstatsChart.dispose()
    }
    if (usedmemoryChart) {
      usedmemoryChart.dispose()
    }

    const commandstatsIntance = echarts.init(commandstats.value, 'macarons')
    commandstatsChart = commandstatsIntance
    commandstatsIntance.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      series: [
        {
          name: '命令',
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: response.data.commandStats,
          animationEasing: 'cubicInOut',
          animationDuration: 1000
        }
      ]
    })

    const usedmemoryInstance = echarts.init(usedmemory.value, 'macarons')
    usedmemoryChart = usedmemoryInstance
    usedmemoryInstance.setOption({
      tooltip: {
        formatter: `{b} <br/>{a} : ${cache.value.info.used_memory_human}`
      },
      series: [
        {
          name: '峰值',
          type: 'gauge',
          min: 0,
          max: 1000,
          detail: {
            formatter: cache.value.info.used_memory_human
          },
          data: [
            {
              value: parseMemoryValue(cache.value.info.used_memory_human),
              name: '内存消耗'
            }
          ]
        }
      ]
    })
  })
}

getList()

// 组件卸载时清理图表实例
onUnmounted(() => {
  if (commandstatsChart) {
    commandstatsChart.dispose()
    commandstatsChart = null
  }
  if (usedmemoryChart) {
    usedmemoryChart.dispose()
    usedmemoryChart = null
  }
})
</script>
