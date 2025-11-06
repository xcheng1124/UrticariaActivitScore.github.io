/**
 * 本地存储工具类
 * 用于管理荨麻疹评分记录的持久化存储
 */

const STORAGE_KEY = 'uas7_records'

/**
 * 获取所有记录
 * @returns {Array} 记录数组
 */
export function getAllRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('获取记录失败:', error)
    return []
  }
}

/**
 * 保存记录
 * @param {Object} record 记录对象
 * @returns {boolean} 是否保存成功
 */
export function saveRecord(record) {
  try {
    const records = getAllRecords()
    const existingIndex = records.findIndex((r) => r.date === record.date)

    if (existingIndex !== -1) {
      // 更新已存在的记录
      records[existingIndex] = {
        ...record,
        updateTime: Date.now()
      }
    } else {
      // 添加新记录
      records.push({
        ...record,
        recordId: `record_${Date.now()}`,
        createTime: Date.now(),
        updateTime: Date.now()
      })
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    return true
  } catch (error) {
    console.error('保存记录失败:', error)
    return false
  }
}

/**
 * 根据日期获取记录
 * @param {string} date 日期字符串 YYYY-MM-DD
 * @returns {Object|null} 记录对象
 */
export function getRecordByDate(date) {
  const records = getAllRecords()
  return records.find((r) => r.date === date) || null
}

/**
 * 删除记录
 * @param {string} date 日期字符串
 * @returns {boolean} 是否删除成功
 */
export function deleteRecord(date) {
  try {
    const records = getAllRecords()
    const filteredRecords = records.filter((r) => r.date !== date)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords))
    return true
  } catch (error) {
    console.error('删除记录失败:', error)
    return false
  }
}

/**
 * 导出数据为JSON
 * @returns {string} JSON字符串
 */
export function exportDataAsJSON() {
  const records = getAllRecords()
  return JSON.stringify(records, null, 2)
}

/**
 * 导出数据为CSV
 * @returns {string} CSV字符串
 */
export function exportDataAsCSV() {
  const records = getAllRecords()
  if (records.length === 0) return ''

  const headers = ['日期', '风团数量评分', '瘙痒程度评分', '每日总分', '备注']
  const rows = records.map((r) => [
    r.date,
    r.whealScore,
    r.itchScore,
    r.totalScore,
    r.note || ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\n')

  return csvContent
}

/**
 * 从JSON导入数据
 * @param {string} jsonString JSON字符串
 * @returns {boolean} 是否导入成功
 */
export function importDataFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    if (!Array.isArray(data)) {
      throw new Error('无效的数据格式')
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('导入数据失败:', error)
    return false
  }
}

/**
 * 清空所有数据
 * @returns {boolean} 是否清空成功
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('清空数据失败:', error)
    return false
  }
}

/**
 * 下载文件到本地
 * @param {string} content 文件内容
 * @param {string} filename 文件名
 * @param {string} contentType 内容类型
 */
export function downloadFile(content, filename, contentType = 'text/plain') {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

