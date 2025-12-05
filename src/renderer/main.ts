import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './styles/index.scss'
import './permission'
import App from './App.vue'
import router from './router'
import { errorHandler } from './error'
import './utils/hackIpcRenderer'
import 'uno.css'

const app = createApp(App)
const store = createPinia()
app.use(router)
app.use(store)
errorHandler(app)

app.mount('#app')
