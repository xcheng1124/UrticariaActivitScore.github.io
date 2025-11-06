<template>
  <div class="chart-view">
    <!-- 时间范围选择 -->
    <van-cell-group inset class="range-section">
      <van-tabs v-model:active="activeRange" @change="handleRangeChange">
        <van-tab title="7天" name="7" />
        <van-tab title="14天" name="14" />
        <van-tab title="30天" name="30" />
        <van-tab title="全部" name="all" />
      </van-tabs>
    </van-cell-group>

    <!-- 统计卡片 -->
    <van-cell-group inset class="stats-cards">
      <div class="cards-grid">
        <div class="stat-card">
          <div class="card-icon" style="background: #1989fa;">
            <van-icon name="bars" size="24" color="#fff" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ rangeStats.totalDays }}</div>
            <div class="card-label">记录天数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="card-icon" style="background: #07c160;">
            <van-icon name="chart-trending-o" size="24" color="#fff" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ rangeStats.avgScore }}</div>
            <div class="card-label">平均分</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="card-icon" style="background: #ff976a;">
            <van-icon name="arrow-up" size="24" color="#fff" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ rangeStats.maxScore }}</div>
            <div class="card-label">最高分</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="card-icon" style="background: #ee0a24;">
            <van-icon name="arrow-down" size="24" color="#fff" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ rangeStats.minScore }}</div>
            <div class="card-label">最低分</div>
          </div>
        </div>
      </div>
    </van-cell-group>

    <!-- 图表切换 -->
    <van-cell-group inset class="chart-tabs">
      <van-tabs v-model:active="activeChart">
        <van-tab title="总分趋势" name="trend" />
        <van-tab title="对比分析" name="compare" />
        <van-tab title="周期统计" name="weekly" />
        <van-tab title="分布占比" name="pie" />
      </van-tabs>
    </van-cell-group>

    <!-- 图表容器 -->
    <van-cell-group inset class="chart-container">
      <div v-show="activeChart === 'trend'" ref="trendChart" class="chart"></div>
      <div v-show="activeChart === 'compare'" ref="compareChart" class="chart"></div>
      <div v-show="activeChart === 'weekly'" ref="weeklyChart" class="chart"></div>
      <div v-show="activeChart === 'pie'" ref="pieChart" class="chart"></div>
    </van-cell-group>

    <!-- UAS7 周期评分 -->
    <van-cell-group v-if="uas7Scores.length > 0" inset class="uas7-section">
      <van-cell title="UAS7 周期评分" icon="chart-trending-o" />
      <div class="uas7-list">
        <div
          v-for="score in uas7Scores"
          :key="score.week"
          class="uas7-item"
        >
          <div class="uas7-label">{{ score.label }}</div>
          <div class="uas7-progress">
            <van-progress
              :percentage="(score.score / 42) * 100"
              :pivot-text="score.score + '分'"
              color="linear-gradient(to right, #1989fa, #07c160)"
            />
          </div>
          <div class="uas7-info">
            {{ score.startDate }} 至 {{ score.endDate }} (已记录{{ score.recordedDays }}天)
          </div>
        </div>
      </div>
    </van-cell-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useRecordStore } from '@/stores/record'
import dayjs from 'dayjs'

// 注册ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  BarChart,
  PieChart,
  CanvasRenderer
])

const recordStore = useRecordStore()

// 响应式数据
const activeRange = ref('7')
const activeChart = ref('trend')
const trendChart = ref(null)
const compareChart = ref(null)
const weeklyChart = ref(null)
const pieChart = ref(null)

let trendChartInstance = null
let compareChartInstance = null
let weeklyChartInstance = null
let pieChartInstance = null

// 计算属性
const trendData = computed(() => {
  const days = activeRange.value === 'all' ? 90 : parseInt(activeRange.value)
  return recordStore.getTrendData(days)
})

const rangeStats = computed(() => {
  const data = trendData.value.filter(d => d.hasRecord)
  if (data.length === 0) {
    return { totalDays: 0, avgScore: 0, maxScore: 0, minScore: 0 }
  }

  const scores = data.map(d => d.totalScore)
  const total = scores.reduce((sum, s) => sum + s, 0)

  return {
    totalDays: data.length,
    avgScore: (total / data.length).toFixed(1),
    maxScore: Math.max(...scores),
    minScore: Math.min(...scores)
  }
})

const uas7Scores = computed(() => recordStore.uas7Scores)

// 方法
const handleRangeChange = () => {
  updateAllCharts()
}

const initTrendChart = () => {
  if (!trendChart.value) return

  trendChartInstance = echarts.init(trendChart.value)

  const dates = trendData.value.map(d => dayjs(d.date).format('M/D'))
  const scores = trendData.value.map(d => d.totalScore)

  const option = {
    title: {
      text: '每日总分趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = trendData.value[params[0].dataIndex]
        return `
          ${data.date}<br/>
          总分: ${data.totalScore}分<br/>
          风团: ${data.whealScore}分<br/>
          瘙痒: ${data.itchScore}分
        `
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '20%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      max: 6,
      min: 0,
      interval: 1
    },
    series: [
      {
        name: '总分',
        type: 'line',
        data: scores,
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(25, 137, 250, 0.3)' },
              { offset: 1, color: 'rgba(25, 137, 250, 0.05)' }
            ]
          }
        },
        itemStyle: {
          color: '#1989fa'
        },
        lineStyle: {
          width: 2
        }
      }
    ]
  }

  trendChartInstance.setOption(option)
}

const initCompareChart = () => {
  if (!compareChart.value) return

  compareChartInstance = echarts.init(compareChart.value)

  const dates = trendData.value.map(d => dayjs(d.date).format('M/D'))
  const whealScores = trendData.value.map(d => d.whealScore)
  const itchScores = trendData.value.map(d => d.itchScore)

  const option = {
    title: {
      text: '风团数量 vs 瘙痒程度',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['风团数量', '瘙痒程度'],
      bottom: 0
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '20%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      max: 3,
      min: 0,
      interval: 1
    },
    series: [
      {
        name: '风团数量',
        type: 'line',
        data: whealScores,
        smooth: true,
        itemStyle: { color: '#ff976a' }
      },
      {
        name: '瘙痒程度',
        type: 'line',
        data: itchScores,
        smooth: true,
        itemStyle: { color: '#07c160' }
      }
    ]
  }

  compareChartInstance.setOption(option)
}

const initWeeklyChart = () => {
  if (!weeklyChart.value) return

  weeklyChartInstance = echarts.init(weeklyChart.value)

  const labels = uas7Scores.value.map(s => s.label)
  const scores = uas7Scores.value.map(s => s.score)

  const option = {
    title: {
      text: 'UAS7 周期评分对比',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '15%',
      right: '10%',
      bottom: '10%',
      top: '20%'
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '分数',
      max: 42
    },
    series: [
      {
        name: 'UAS7评分',
        type: 'bar',
        data: scores,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#1989fa' },
              { offset: 1, color: '#07c160' }
            ]
          }
        },
        barWidth: '50%'
      }
    ]
  }

  weeklyChartInstance.setOption(option)
}

const initPieChart = () => {
  if (!pieChart.value) return

  pieChartInstance = echarts.init(pieChart.value)

  const data = trendData.value.filter(d => d.hasRecord)
  const distribution = {
    '无症状(0分)': 0,
    '轻度(1-2分)': 0,
    '中度(3-4分)': 0,
    '重度(5-6分)': 0
  }

  data.forEach(d => {
    if (d.totalScore === 0) distribution['无症状(0分)']++
    else if (d.totalScore <= 2) distribution['轻度(1-2分)']++
    else if (d.totalScore <= 4) distribution['中度(3-4分)']++
    else distribution['重度(5-6分)']++
  })

  const pieData = Object.keys(distribution).map(key => ({
    name: key,
    value: distribution[key]
  })).filter(item => item.value > 0)

  const option = {
    title: {
      text: '病情严重程度分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}天 ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: {
        fontSize: 10
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          fontSize: 10
        },
        itemStyle: {
          color: (params) => {
            const colors = ['#07c160', '#1989fa', '#ff976a', '#ee0a24']
            return colors[params.dataIndex]
          }
        }
      }
    ]
  }

  pieChartInstance.setOption(option)
}

const updateAllCharts = () => {
  nextTick(() => {
    initTrendChart()
    initCompareChart()
    initWeeklyChart()
    initPieChart()
  })
}

// 监听图表切换
watch(activeChart, () => {
  nextTick(() => {
    if (activeChart.value === 'trend' && trendChartInstance) {
      trendChartInstance.resize()
    } else if (activeChart.value === 'compare' && compareChartInstance) {
      compareChartInstance.resize()
    } else if (activeChart.value === 'weekly' && weeklyChartInstance) {
      weeklyChartInstance.resize()
    } else if (activeChart.value === 'pie' && pieChartInstance) {
      pieChartInstance.resize()
    }
  })
})

// 初始化
onMounted(() => {
  updateAllCharts()

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    trendChartInstance?.resize()
    compareChartInstance?.resize()
    weeklyChartInstance?.resize()
    pieChartInstance?.resize()
  })
})
</script>

<style scoped>
.chart-view {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 12px;
  padding-bottom: 80px;
}

.range-section,
.stats-cards,
.chart-tabs,
.chart-container,
.uas7-section {
  margin-bottom: 12px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #323233;
  line-height: 1;
  margin-bottom: 4px;
}

.card-label {
  font-size: 12px;
  color: #969799;
}

.chart {
  width: 100%;
  height: 300px;
}

.uas7-list {
  padding: 12px 16px;
}

.uas7-item {
  margin-bottom: 20px;
}

.uas7-item:last-child {
  margin-bottom: 0;
}

.uas7-label {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 8px;
}

.uas7-progress {
  margin-bottom: 6px;
}

.uas7-info {
  font-size: 12px;
  color: #969799;
}

/* 移动端适配 */
@media (max-width: 375px) {
  .cards-grid {
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
  }

  .card-value {
    font-size: 20px;
  }

  .chart {
    height: 280px;
  }
}
</style>

