import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/record'
    },
    {
      path: '/record',
      name: 'record',
      component: () => import('../views/RecordView.vue'),
      meta: { title: '记录' }
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
      meta: { title: '历史' }
    },
    {
      path: '/chart',
      name: 'chart',
      component: () => import('../views/ChartView.vue'),
      meta: { title: '统计' }
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('../views/SettingView.vue'),
      meta: { title: '设置' }
    }
  ]
})

export default router
