<template>
  <div class="history-view">
    <!-- 统计概览 -->
    <van-cell-group inset class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ statistics.recordedDays }}</div>
          <div class="stat-label">记录天数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.avgScore }}</div>
          <div class="stat-label">平均分</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.maxScore }}</div>
          <div class="stat-label">最高分</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.minScore }}</div>
          <div class="stat-label">最低分</div>
        </div>
      </div>
    </van-cell-group>

    <!-- 筛选栏 -->
    <van-cell-group inset class="filter-section">
      <van-tabs v-model:active="activeFilter" @change="handleFilterChange">
        <van-tab title="全部" name="all" />
        <van-tab title="本周" name="week" />
        <van-tab title="本月" name="month" />
      </van-tabs>
    </van-cell-group>

    <!-- 记录列表 -->
    <div class="record-list">
      <van-empty
        v-if="filteredRecords.length === 0"
        description="暂无记录数据"
        image="search"
      />

      <van-cell-group
        v-else
        inset
        v-for="record in filteredRecords"
        :key="record.date"
        class="record-item"
      >
        <van-swipe-cell>
          <van-cell @click="handleEditRecord(record)">
            <template #title>
              <div class="record-date">
                <span class="date-text">{{ formatDate(record.date) }}</span>
                <van-tag v-if="isToday(record.date)" type="success" size="medium">
                  今天
                </van-tag>
              </div>
            </template>
            <template #label>
              <div class="record-details">
                <div class="detail-row">
                  <van-icon name="notes-o" />
                  <span>风团数量: {{ record.whealScore }}分 ({{ getScoreLabel(record.whealScore) }})</span>
                </div>
                <div class="detail-row">
                  <van-icon name="fire-o" />
                  <span>瘙痒程度: {{ record.itchScore }}分 ({{ getScoreLabel(record.itchScore) }})</span>
                </div>
                <div v-if="record.note" class="detail-row note-row">
                  <van-icon name="chat-o" />
                  <span>{{ record.note }}</span>
                </div>
              </div>
            </template>
            <template #value>
              <div class="record-score">
                <div class="total-score">{{ record.totalScore }}</div>
                <div class="score-label">总分</div>
              </div>
            </template>
          </van-cell>
          <template #right>
            <van-button
              square
              type="danger"
              text="删除"
              class="delete-button"
              @click="handleDeleteRecord(record.date)"
            />
          </template>
        </van-swipe-cell>
      </van-cell-group>
    </div>

    <!-- 日期编辑弹窗 -->
    <van-popup v-model:show="showEditPopup" position="bottom" round>
      <div class="edit-popup">
        <div class="popup-header">
          <van-button type="primary" text @click="showEditPopup = false">
            取消
          </van-button>
          <div class="popup-title">编辑记录</div>
          <van-button type="primary" text @click="handleSaveEdit">
            保存
          </van-button>
        </div>
        <div class="popup-content">
          <van-field
            v-model="editForm.date"
            label="日期"
            readonly
            disabled
          />
          <van-field label="风团数量">
            <template #input>
              <van-radio-group v-model="editForm.whealScore" direction="horizontal">
                <van-radio :name="0">无</van-radio>
                <van-radio :name="1">轻度</van-radio>
                <van-radio :name="2">中度</van-radio>
                <van-radio :name="3">重度</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field label="瘙痒程度">
            <template #input>
              <van-radio-group v-model="editForm.itchScore" direction="horizontal">
                <van-radio :name="0">无</van-radio>
                <van-radio :name="1">轻度</van-radio>
                <van-radio :name="2">中度</van-radio>
                <van-radio :name="3">重度</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            v-model="editForm.note"
            rows="2"
            autosize
            type="textarea"
            maxlength="200"
            placeholder="备注（可选）"
            show-word-limit
          />
          <div class="edit-total">
            总分：{{ editForm.whealScore + editForm.itchScore }} 分
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { useRecordStore } from '@/stores/record'
import { formatDisplayDate, isToday as checkIsToday, getToday } from '@/utils/date'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const recordStore = useRecordStore()

// 响应式数据
const activeFilter = ref('all')
const showEditPopup = ref(false)
const editForm = ref({
  date: '',
  whealScore: 0,
  itchScore: 0,
  note: ''
})

// 计算属性
const statistics = computed(() => recordStore.statistics)

const filteredRecords = computed(() => {
  const records = recordStore.sortedRecords

  if (activeFilter.value === 'all') {
    return records
  }

  const today = dayjs()
  let startDate

  if (activeFilter.value === 'week') {
    startDate = today.subtract(7, 'day')
  } else if (activeFilter.value === 'month') {
    startDate = today.subtract(30, 'day')
  }

  return records.filter(record => {
    return dayjs(record.date).isSameOrAfter(startDate, 'day')
  })
})

// 方法
const formatDate = (date) => {
  return formatDisplayDate(date)
}

const isToday = (date) => {
  return checkIsToday(date)
}

const getScoreLabel = (score) => {
  const labels = ['无', '轻度', '中度', '重度']
  return labels[score] || '未知'
}

const handleFilterChange = () => {
  // 筛选变化时的处理
}

const handleEditRecord = (record) => {
  editForm.value = {
    date: record.date,
    whealScore: record.whealScore,
    itchScore: record.itchScore,
    note: record.note || ''
  }
  showEditPopup.value = true
}

const handleSaveEdit = () => {
  const success = recordStore.saveOrUpdateRecord({
    date: editForm.value.date,
    whealScore: editForm.value.whealScore,
    itchScore: editForm.value.itchScore,
    note: editForm.value.note
  })

  if (success) {
    showToast({
      message: '更新成功',
      icon: 'success'
    })
    showEditPopup.value = false
  } else {
    showToast({
      message: '更新失败',
      icon: 'fail'
    })
  }
}

const handleDeleteRecord = async (date) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要删除这条记录吗？'
    })

    const success = recordStore.removeRecord(date)
    if (success) {
      showToast({
        message: '删除成功',
        icon: 'success'
      })
    } else {
      showToast({
        message: '删除失败',
        icon: 'fail'
      })
    }
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped>
.history-view {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 12px;
  padding-bottom: 80px;
}

.stats-section {
  margin-bottom: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 16px 0;
}

.stat-item {
  text-align: center;
  padding: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1989fa;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #969799;
}

.filter-section {
  margin-bottom: 12px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  margin-bottom: 0;
}

.record-date {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.date-text {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.record-details {
  font-size: 14px;
  color: #646566;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.note-row {
  color: #969799;
}

.record-score {
  text-align: center;
}

.total-score {
  font-size: 28px;
  font-weight: bold;
  color: #1989fa;
  line-height: 1;
  margin-bottom: 4px;
}

.score-label {
  font-size: 12px;
  color: #969799;
}

.delete-button {
  height: 100%;
}

.edit-popup {
  padding-bottom: 20px;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.popup-content {
  padding: 16px;
}

.edit-total {
  text-align: center;
  padding: 16px;
  margin-top: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

/* 移动端适配 */
@media (max-width: 375px) {
  .stats-grid {
    gap: 4px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 11px;
  }

  .total-score {
    font-size: 24px;
  }
}
</style>

