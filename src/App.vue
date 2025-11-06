<script setup>
import { ref, watch } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const active = ref('record')

// 监听路由变化更新底部导航
watch(
  () => route.path,
  (path) => {
    const name = path.split('/')[1] || 'record'
    active.value = name
  },
  { immediate: true }
)

// 底部导航切换
const handleTabChange = (name) => {
  router.push(`/${name}`)
}
</script>

<template>
  <div class="app-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <RouterView />
    </div>

    <!-- 底部导航栏 -->
    <van-tabbar v-model="active" @change="handleTabChange" :placeholder="true">
      <van-tabbar-item name="record" icon="edit">记录</van-tabbar-item>
      <van-tabbar-item name="history" icon="orders-o">历史</van-tabbar-item>
      <van-tabbar-item name="chart" icon="chart-trending-o">统计</van-tabbar-item>
      <van-tabbar-item name="setting" icon="setting-o">设置</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100%;
}

.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Vant组件全局样式调整 */
.van-tabbar {
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}
</style>
