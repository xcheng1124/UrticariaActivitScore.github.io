import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 引入Vant组件库
import Vant from 'vant'
import 'vant/lib/index.css'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

// 注册Vant组件
app.use(Vant)
app.use(createPinia())
app.use(router)

app.mount('#app')
