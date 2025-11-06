/**
 * 日期工具函数
 */
import dayjs from 'dayjs'

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string|number} date 日期
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * 获取今天的日期
 * @returns {string} YYYY-MM-DD 格式
 */
export function getToday() {
  return dayjs().format('YYYY-MM-DD')
}

/**
 * 获取指定日期范围内的所有日期
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期
 * @returns {Array<string>} 日期数组
 */
export function getDateRange(startDate, endDate) {
  const dates = []
  let current = dayjs(startDate)
  const end = dayjs(endDate)

  while (current.isBefore(end) || current.isSame(end)) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }

  return dates
}

/**
 * 获取最近N天的日期
 * @param {number} days 天数
 * @returns {Array<string>} 日期数组
 */
export function getRecentDates(days) {
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    dates.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
  }
  return dates
}

/**
 * 计算两个日期之间的天数差
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期
 * @returns {number} 天数差
 */
export function getDaysDiff(startDate, endDate) {
  return dayjs(endDate).diff(dayjs(startDate), 'day')
}

/**
 * 获取日期所在周的第几天
 * @param {string} date 日期
 * @returns {number} 1-7 (周一到周日)
 */
export function getDayOfWeek(date) {
  const day = dayjs(date).day()
  return day === 0 ? 7 : day
}

/**
 * 格式化显示日期（中文）
 * @param {string} date 日期
 * @returns {string} 格式化后的日期，如"11月5日 周三"
 */
export function formatDisplayDate(date) {
  const d = dayjs(date)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.format('M月D日')} ${weekdays[d.day()]}`
}

/**
 * 判断是否为今天
 * @param {string} date 日期
 * @returns {boolean}
 */
export function isToday(date) {
  return dayjs(date).isSame(dayjs(), 'day')
}

/**
 * 获取本月第一天
 * @returns {string}
 */
export function getMonthStart() {
  return dayjs().startOf('month').format('YYYY-MM-DD')
}

/**
 * 获取本月最后一天
 * @returns {string}
 */
export function getMonthEnd() {
  return dayjs().endOf('month').format('YYYY-MM-DD')
}

