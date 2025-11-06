<template>
  <div class="record-view">
    <!-- 日期选择区域 -->
    <van-cell-group inset class="date-section">
      <van-cell center>
        <template #title>
          <div class="date-selector">
            <van-button
              icon="arrow-left"
              size="small"
              @click="handlePreviousDay"
            />
            <div class="date-display" @click="showDatePicker = true">
              <div class="date-text">{{ displayDate }}</div>
              <van-tag v-if="isToday" type="success">今天</van-tag>
            </div>
            <van-button
              icon="arrow"
              size="small"
              @click="handleNextDay"
              :disabled="isToday"
            />
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 评分说明 -->
    <van-cell-group inset class="info-section">
      <van-collapse v-model="activeNames"   title="评分标准说明">
        <van-collapse-item name="1"   title="评分标准说明"
        icon="info-o">
          <div class="info-content">
            <div class="info-item">
              <div class="info-title">风团数量：</div>
              <div class="info-desc">
                <p>• 无(0分)</p>
                <p>• 轻度(1分)：&lt;20个/24h</p>
                <p>• 中度(2分)：20-50个/24h</p>
                <p>• 重度(3分)：&gt;50个/24h或大片融合</p>
              </div>
            </div>
            <van-divider />
            <div class="info-item">
              <div class="info-title">瘙痒程度：</div>
              <div class="info-desc">
                <p>• 无(0分)</p>
                <p>• 轻度(1分)：存在，但不引起烦躁或麻烦</p>
                <p>• 中度(2分)：有麻烦，但不影响日常生活及睡眠</p>
                <p>• 重度(3分)：严重瘙痒，明显影响日常生活及睡眠</p>
              </div>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
    </van-cell-group>

    <!-- 评分表单 -->
    <van-cell-group inset class="score-section">
      <van-cell title="风团数量" icon="notes-o" />
      <div class="score-buttons">
        <div
          v-for="score in scoreOptions"
          :key="`wheal-${score.value}`"
          :class="['score-btn', { active: formData.whealScore === score.value }]"
          @click="formData.whealScore = score.value"
        >
          <div class="score-value">{{ score.value }}</div>
          <div class="score-label">{{ score.label }}</div>
        </div>
      </div>
    </van-cell-group>

    <van-cell-group inset class="score-section">
      <van-cell title="瘙痒程度" icon="fire-o" />
      <div class="score-buttons">
        <div
          v-for="score in scoreOptions"
          :key="`itch-${score.value}`"
          :class="['score-btn', { active: formData.itchScore === score.value }]"
          @click="formData.itchScore = score.value"
        >
          <div class="score-value">{{ score.value }}</div>
          <div class="score-label">{{ score.label }}</div>
        </div>
      </div>
    </van-cell-group>

    <!-- 每日总分 -->
    <van-cell-group inset class="total-section">
      <div class="total-score">
        <div class="total-label">每日总分</div>
        <div class="total-value">
          <span class="score-number">{{ totalScore }}</span>
          <span class="score-unit">分</span>
        </div>
        <div class="total-desc">风团 {{ formData.whealScore }} + 瘙痒 {{ formData.itchScore }}</div>
      </div>
    </van-cell-group>

    <!-- 备注 -->
    <van-cell-group inset class="note-section">
      <van-field
        v-model="formData.note"
        rows="3"
        autosize
        type="textarea"
        maxlength="200"
        placeholder="记录今日特殊情况、症状描述等（可选）"
        show-word-limit
      />
    </van-cell-group>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <van-button
        type="primary"
        size="large"
        block
        :loading="saving"
        @click="handleSave"
      >
        {{ hasExistingRecord ? '更新记录' : '保存记录' }}
      </van-button>
      <van-button
        v-if="hasExistingRecord"
        type="danger"
        size="large"
        block
        @click="handleDelete"
      >
        删除记录
      </van-button>
    </div>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="handleDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'
import { useRecordStore } from '@/stores/record'
import { getToday, formatDisplayDate, isToday as checkIsToday } from '@/utils/date'

const recordStore = useRecordStore()

// 响应式数据
const currentDate = dayjs().format('YYYY-MM-DD')
const selectedDate = ref([
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  new Date().getDate()
])
const showDatePicker = ref(false)
const activeNames = ref([])
const saving = ref(false)

const formData = ref({
  whealScore: 0,
  itchScore: 0,
  note: ''
})

const scoreOptions = [
  { value: 0, label: '无' },
  { value: 1, label: '轻度' },
  { value: 2, label: '中度' },
  { value: 3, label: '重度' }
]

// 日期选择器的最小和最大日期
const minDate = new Date(2020, 0, 1)
const maxDate = new Date()

// 计算属性
const currentDateStr = computed(() => {
  return `${selectedDate.value[0]}-${String(selectedDate.value[1]).padStart(2, '0')}-${String(selectedDate.value[2]).padStart(2, '0')}`
})

const displayDate = computed(() => {
  return formatDisplayDate(currentDateStr.value)
})

const isToday = computed(() => {
  return checkIsToday(currentDateStr.value)
})

const totalScore = computed(() => {
  return formData.value.whealScore + formData.value.itchScore
})

const hasExistingRecord = computed(() => {
  return !!recordStore.getRecordByDate(currentDateStr.value)
})

// 方法
const toggleInfo = () => {
  activeNames.value = activeNames.value.length > 0 ? [] : ['1']
}

const loadRecordForDate = () => {
  const record = recordStore.getRecordByDate(currentDateStr.value)
  if (record) {
    formData.value = {
      whealScore: record.whealScore,
      itchScore: record.itchScore,
      note: record.note || ''
    }
  } else {
    formData.value = {
      whealScore: 0,
      itchScore: 0,
      note: ''
    }
  }
}

const handleDateConfirm = () => {
  showDatePicker.value = false
  recordStore.setCurrentDate(currentDateStr.value)
  loadRecordForDate()
}

const handlePreviousDay = () => {
  const newDate = dayjs(currentDateStr.value).subtract(1, 'day')
  selectedDate.value = [
    newDate.year(),
    newDate.month() + 1,
    newDate.date()
  ]
  recordStore.setCurrentDate(currentDateStr.value)
  loadRecordForDate()
}

const handleNextDay = () => {
  if (!isToday.value) {
    const newDate = dayjs(currentDateStr.value).add(1, 'day')
    selectedDate.value = [
      newDate.year(),
      newDate.month() + 1,
      newDate.date()
    ]
    recordStore.setCurrentDate(currentDateStr.value)
    loadRecordForDate()
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    const success = recordStore.saveOrUpdateRecord({
      date: currentDateStr.value,
      whealScore: formData.value.whealScore,
      itchScore: formData.value.itchScore,
      note: formData.value.note
    })

    if (success) {
      showToast({
        message: hasExistingRecord.value ? '更新成功' : '保存成功',
        icon: 'success'
      })
    } else {
      showToast({
        message: '保存失败，请重试',
        icon: 'fail'
      })
    }
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要删除这条记录吗？'
    })

    const success = recordStore.removeRecord(currentDateStr.value)
    if (success) {
      showToast({
        message: '删除成功',
        icon: 'success'
      })
      loadRecordForDate()
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

// 初始化
onMounted(() => {
  loadRecordForDate()
})

// 监听日期变化
watch(() => currentDateStr.value, () => {
  loadRecordForDate()
})
</script>

<style scoped>
.record-view {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 12px;
  padding-bottom: 80px;
}

.date-section {
  margin-bottom: 12px;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.date-display {
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
}

.date-text {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.info-section {
  margin-bottom: 12px;
}

.info-content {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
}

.info-item {
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-title {
  font-weight: 600;
  color: #1989fa;
  margin-bottom: 8px;
}

.info-desc p {
  margin: 4px 0;
  color: #646566;
}

.score-section {
  margin-bottom: 12px;
}

.score-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;
}

.score-btn {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #ebedf0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.score-btn.active {
  background: linear-gradient(135deg, #1989fa 0%, #1677ff 100%);
  border-color: #1989fa;
  transform: scale(1.05);
  box-shadow: 0 2px 12px rgba(25, 137, 250, 0.3);
}

.score-value {
  font-size: 28px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
}

.score-btn.active .score-value {
  color: #fff;
}

.score-label {
  font-size: 12px;
  color: #969799;
}

.score-btn.active .score-label {
  color: rgba(255, 255, 255, 0.9);
}

.total-section {
  margin-bottom: 12px;
}

.total-score {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  text-align: center;
  color: #fff;
}

.total-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.total-value {
  margin-bottom: 8px;
}

.score-number {
  font-size: 48px;
  font-weight: bold;
}

.score-unit {
  font-size: 20px;
  margin-left: 4px;
}

.total-desc {
  font-size: 14px;
  opacity: 0.8;
}

.note-section {
  margin-bottom: 12px;
}

.action-buttons {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .score-buttons {
    gap: 6px;
  }

  .score-value {
    font-size: 24px;
  }

  .score-number {
    font-size: 40px;
  }
}
</style>

