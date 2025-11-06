<template>
  <div class="setting-view">
    <!-- 数据统计 -->
    <van-cell-group inset class="data-stats">
      <van-cell title="数据统计" icon="bar-chart-o" :border="false">
        <template #label>
          <div class="stats-info">
            <div class="stat-row">
              <span class="stat-label">总记录数：</span>
              <span class="stat-value">{{ statistics.recordedDays }} 条</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">平均分：</span>
              <span class="stat-value">{{ statistics.avgScore }} 分</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">数据大小：</span>
              <span class="stat-value">{{ dataSize }}</span>
            </div>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 评分标准说明 -->
    <van-cell-group inset class="standard-section">
      <van-cell
        title="评分标准说明"
        icon="info-o"
        is-link
        @click="showStandard = true"
      />
    </van-cell-group>

    <!-- 数据管理 -->
    <van-cell-group inset class="data-management">
      <van-cell title="数据管理" icon="orders-o" :border="false" />
      <van-cell
        title="导出为JSON"
        icon="down"
        is-link
        @click="handleExport('json')"
      >
        <template #label>
          <span class="cell-desc">导出所有数据为JSON格式，便于备份</span>
        </template>
      </van-cell>
      <van-cell
        title="导出为CSV"
        icon="description"
        is-link
        @click="handleExport('csv')"
      >
        <template #label>
          <span class="cell-desc">导出为CSV格式，可在Excel中打开</span>
        </template>
      </van-cell>
      <van-cell
        title="导入数据"
        icon="upgrade"
        is-link
        @click="handleImport"
      >
        <template #label>
          <span class="cell-desc">从备份文件中恢复数据</span>
        </template>
      </van-cell>
      <van-cell
        title="清空所有数据"
        icon="delete-o"
        is-link
        @click="handleClearAll"
      >
        <template #label>
          <span class="cell-desc">删除所有记录，此操作不可恢复</span>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 关于 -->
    <van-cell-group inset class="about-section">
      <van-cell title="关于应用" icon="info-o" :border="false" />
      <van-cell title="应用名称" value="荨麻疹活动度评分" />
      <van-cell title="版本号" value="v1.0.0" />
      <van-cell
        title="使用说明"
        is-link
        @click="showHelp = true"
      />
    </van-cell-group>

    <!-- 评分标准弹窗 -->
    <van-popup v-model:show="showStandard" round position="bottom" :style="{ height: '70%' }">
      <div class="popup-content">
        <div class="popup-header">
          <h3>荨麻疹活动度评分标准（UAS7）</h3>
        </div>
        <div class="popup-body">
          <van-divider content-position="left">风团数量评分</van-divider>
          <div class="standard-item">
            <div class="score-badge">0分</div>
            <div class="score-desc">无风团</div>
          </div>
          <div class="standard-item">
            <div class="score-badge">1分</div>
            <div class="score-desc">轻度：少于20个风团/24小时</div>
          </div>
          <div class="standard-item">
            <div class="score-badge">2分</div>
            <div class="score-desc">中度：20-50个风团/24小时</div>
          </div>
          <div class="standard-item">
            <div class="score-badge">3分</div>
            <div class="score-desc">重度：大于50个风团/24小时或大片融合区域</div>
          </div>

          <van-divider content-position="left">瘙痒程度评分</van-divider>
          <div class="standard-item">
            <div class="score-badge">0分</div>
            <div class="score-desc">无瘙痒</div>
          </div>
          <div class="standard-item">
            <div class="score-badge">1分</div>
            <div class="score-desc">轻度：存在，但不引起烦躁或麻烦</div>
          </div>
          <div class="standard-item">
            <div class="score-badge">2分</div>
            <div class="score-desc">中度：有麻烦，但不影响日常生活及睡眠</div>
          </div>
          <div class="standard-item">
            <div class="score-badge">3分</div>
            <div class="score-desc">重度：严重瘙痒，明显影响日常生活及睡眠</div>
          </div>

          <van-divider content-position="left">UAS7 评分说明</van-divider>
          <div class="uas7-info">
            <p>• UAS7 = 连续7天的每日评分总和</p>
            <p>• 每日评分 = 风团数量评分 + 瘙痒程度评分（0-6分）</p>
            <p>• UAS7 总分范围：0-42分</p>
            <p>• UAS7 &lt; 7分：病情控制良好</p>
            <p>• UAS7 7-15分：轻度活动</p>
            <p>• UAS7 16-27分：中度活动</p>
            <p>• UAS7 &gt; 27分：重度活动</p>
          </div>
        </div>
        <div class="popup-footer">
          <van-button type="primary" block @click="showStandard = false">
            我知道了
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 使用说明弹窗 -->
    <van-popup v-model:show="showHelp" round position="bottom" :style="{ height: '70%' }">
      <div class="popup-content">
        <div class="popup-header">
          <h3>使用说明</h3>
        </div>
        <div class="popup-body">
          <van-divider content-position="left">记录页面</van-divider>
          <p>1. 选择日期，默认为今天</p>
          <p>2. 根据当天症状，分别选择风团数量和瘙痒程度评分</p>
          <p>3. 可添加备注记录特殊情况</p>
          <p>4. 点击保存按钮完成记录</p>

          <van-divider content-position="left">历史记录</van-divider>
          <p>1. 查看所有历史记录</p>
          <p>2. 可按时间范围筛选（本周/本月/全部）</p>
          <p>3. 点击记录可以编辑</p>
          <p>4. 左滑记录可以删除</p>

          <van-divider content-position="left">统计图表</van-divider>
          <p>1. 查看不同时间段的评分趋势</p>
          <p>2. 对比风团数量和瘙痒程度变化</p>
          <p>3. 查看UAS7周期评分统计</p>
          <p>4. 分析病情严重程度分布</p>

          <van-divider content-position="left">数据管理</van-divider>
          <p>1. 定期导出数据进行备份</p>
          <p>2. 可将数据分享给医生查看</p>
          <p>3. 更换设备时可通过导入恢复数据</p>
        </div>
        <div class="popup-footer">
          <van-button type="primary" block @click="showHelp = false">
            我知道了
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 文件输入（隐藏） -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'
import { useRecordStore } from '@/stores/record'

const recordStore = useRecordStore()

// 响应式数据
const showStandard = ref(false)
const showHelp = ref(false)
const fileInput = ref(null)

// 计算属性
const statistics = computed(() => recordStore.statistics)

const dataSize = computed(() => {
  const dataStr = JSON.stringify(recordStore.records)
  const bytes = new Blob([dataStr]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
})

// 方法
const handleExport = (format) => {
  if (recordStore.records.length === 0) {
    showToast('暂无数据可导出')
    return
  }

  try {
    const success = recordStore.exportData(format)
    if (success) {
      showToast({
        message: '导出成功',
        icon: 'success'
      })
    } else {
      showToast({
        message: '导出失败',
        icon: 'fail'
      })
    }
  } catch (error) {
    showToast({
      message: '导出失败：' + error.message,
      icon: 'fail'
    })
  }
}

const handleImport = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const loadingToast = showLoadingToast({
    message: '导入中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const text = await file.text()
    const success = recordStore.importData(text)

    closeToast()

    if (success) {
      showToast({
        message: '导入成功',
        icon: 'success'
      })
    } else {
      showToast({
        message: '导入失败，请检查文件格式',
        icon: 'fail'
      })
    }
  } catch (error) {
    closeToast()
    showToast({
      message: '导入失败：' + error.message,
      icon: 'fail'
    })
  }

  // 重置文件输入
  event.target.value = ''
}

const handleClearAll = async () => {
  try {
    await showConfirmDialog({
      title: '警告',
      message: '确定要清空所有数据吗？此操作不可恢复！',
      confirmButtonText: '确定清空',
      cancelButtonText: '取消'
    })

    const success = recordStore.clearAll()
    if (success) {
      showToast({
        message: '已清空所有数据',
        icon: 'success'
      })
    } else {
      showToast({
        message: '操作失败',
        icon: 'fail'
      })
    }
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped>
.setting-view {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 12px;
  padding-bottom: 80px;
}

.data-stats,
.standard-section,
.data-management,
.about-section {
  margin-bottom: 12px;
}

.stats-info {
  padding-top: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 14px;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #969799;
}

.stat-value {
  color: #323233;
  font-weight: 500;
}

.cell-desc {
  font-size: 12px;
  color: #969799;
}

.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  padding: 20px 16px;
  text-align: center;
  border-bottom: 1px solid #ebedf0;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.popup-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.popup-body p {
  margin: 8px 0;
  color: #646566;
  line-height: 1.6;
}

.standard-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
}

.score-badge {
  min-width: 50px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
  color: #fff;
  border-radius: 16px;
  text-align: center;
  font-weight: 600;
  margin-right: 12px;
}

.score-desc {
  flex: 1;
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
}

.uas7-info {
  padding: 16px;
  background: #fff3e0;
  border-radius: 8px;
  border-left: 4px solid #ff976a;
}

.uas7-info p {
  margin: 6px 0;
  color: #323233;
  font-size: 14px;
}

.popup-footer {
  padding: 16px;
  border-top: 1px solid #ebedf0;
}

/* 移动端适配 */
@media (max-width: 375px) {
  .stat-row {
    font-size: 13px;
  }

  .score-desc {
    font-size: 13px;
  }
}
</style>

