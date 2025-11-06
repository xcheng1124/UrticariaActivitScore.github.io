/**
 * 荨麻疹评分记录 Store
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import {
  getAllRecords,
  saveRecord,
  getRecordByDate,
  deleteRecord,
  exportDataAsJSON,
  exportDataAsCSV,
  importDataFromJSON,
  clearAllData,
  downloadFile
} from '@/utils/storage'
import { getToday, getRecentDates } from '@/utils/date'

export const useRecordStore = defineStore('record', () => {
  // 状态
  const records = ref([])
  const currentDate = ref(getToday())
  const loading = ref(false)

  // 计算属性 - 当前日期的记录
  const currentRecord = computed(() => {
    return records.value.find((r) => r.date === currentDate.value) || null
  })

  // 计算属性 - 按日期排序的记录（最新的在前）
  const sortedRecords = computed(() => {
    return [...records.value].sort((a, b) => {
      return dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    })
  })

  // 计算属性 - 统计信息
  const statistics = computed(() => {
    if (records.value.length === 0) {
      return {
        totalDays: 0,
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        recordedDays: 0
      }
    }

    const scores = records.value.map((r) => r.totalScore)
    const totalScore = scores.reduce((sum, score) => sum + score, 0)

    return {
      totalDays: records.value.length,
      avgScore: (totalScore / records.value.length).toFixed(1),
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      recordedDays: records.value.length
    }
  })

  // 计算属性 - 获取最近7天的UAS7评分
  const uas7Scores = computed(() => {
    const result = []
    const allDates = sortedRecords.value.map((r) => r.date).sort()

    if (allDates.length === 0) return result

    const firstDate = allDates[0]
    const firstDay = dayjs(firstDate)

    // 计算有多少个完整的7天周期
    const totalDays = dayjs(allDates[allDates.length - 1]).diff(firstDay, 'day') + 1
    const weeks = Math.ceil(totalDays / 7)

    for (let i = 0; i < weeks; i++) {
      const weekStart = firstDay.add(i * 7, 'day')
      const weekEnd = weekStart.add(6, 'day')
      const weekDates = []

      for (let j = 0; j < 7; j++) {
        weekDates.push(weekStart.add(j, 'day').format('YYYY-MM-DD'))
      }

      const weekRecords = records.value.filter((r) => weekDates.includes(r.date))
      const weekScore = weekRecords.reduce((sum, r) => sum + r.totalScore, 0)

      result.push({
        week: i + 1,
        label: `第${i * 7 + 1}-${i * 7 + 7}天`,
        startDate: weekStart.format('YYYY-MM-DD'),
        endDate: weekEnd.format('YYYY-MM-DD'),
        score: weekScore,
        recordedDays: weekRecords.length
      })
    }

    return result
  })

  // 获取指定日期范围的记录
  const getRecordsByDateRange = computed(() => {
    return (startDate, endDate) => {
      return records.value.filter((r) => {
        const date = dayjs(r.date)
        return date.isSameOrAfter(startDate) && date.isSameOrBefore(endDate)
      })
    }
  })

  // 获取最近N天的趋势数据（用于图表）
  const getTrendData = computed(() => {
    return (days = 7) => {
      const dates = getRecentDates(days)
      return dates.map((date) => {
        const record = records.value.find((r) => r.date === date)
        return {
          date,
          whealScore: record?.whealScore || 0,
          itchScore: record?.itchScore || 0,
          totalScore: record?.totalScore || 0,
          hasRecord: !!record
        }
      })
    }
  })

  // 方法 - 加载所有记录
  const loadRecords = () => {
    loading.value = true
    try {
      records.value = getAllRecords()
    } finally {
      loading.value = false
    }
  }

  // 方法 - 保存或更新记录
  const saveOrUpdateRecord = (recordData) => {
    const totalScore = recordData.whealScore + recordData.itchScore
    const record = {
      date: recordData.date,
      whealScore: recordData.whealScore,
      itchScore: recordData.itchScore,
      totalScore: totalScore,
      note: recordData.note || ''
    }

    const success = saveRecord(record)
    if (success) {
      loadRecords()
    }
    return success
  }

  // 方法 - 删除记录
  const removeRecord = (date) => {
    const success = deleteRecord(date)
    if (success) {
      loadRecords()
    }
    return success
  }

  // 方法 - 设置当前日期
  const setCurrentDate = (date) => {
    currentDate.value = date
  }

  // 方法 - 导出数据
  const exportData = (format = 'json') => {
    try {
      if (format === 'json') {
        const content = exportDataAsJSON()
        const filename = `uas7_records_${dayjs().format('YYYYMMDD')}.json`
        downloadFile(content, filename, 'application/json')
      } else if (format === 'csv') {
        const content = exportDataAsCSV()
        const filename = `uas7_records_${dayjs().format('YYYYMMDD')}.csv`
        downloadFile(content, filename, 'text/csv')
      }
      return true
    } catch (error) {
      console.error('导出失败:', error)
      return false
    }
  }

  // 方法 - 导入数据
  const importData = (jsonString) => {
    const success = importDataFromJSON(jsonString)
    if (success) {
      loadRecords()
    }
    return success
  }

  // 方法 - 清空所有数据
  const clearAll = () => {
    const success = clearAllData()
    if (success) {
      records.value = []
    }
    return success
  }

  // 初始化时加载数据
  loadRecords()

  return {
    // 状态
    records,
    currentDate,
    loading,

    // 计算属性
    currentRecord,
    sortedRecords,
    statistics,
    uas7Scores,
    getRecordsByDateRange,
    getTrendData,

    // 方法
    loadRecords,
    saveOrUpdateRecord,
    removeRecord,
    setCurrentDate,
    exportData,
    importData,
    clearAll,
    getRecordByDate
  }
})

