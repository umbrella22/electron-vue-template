import Vue from 'vue'
import { ipcRenderer } from 'electron'

import App from './App'
import router from './router'
import store from './store'
// 引用element
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './permission'
// 日志
import './error'
import './icons'
import '@/styles/index.scss'

if (!process.env.IS_WEB) {
  ipcRenderer.invoke("IsUseSysTitle").then(res => {
    if (!res) {
      require('@/styles/custom-title.scss')
    }
  });
}

Vue.use(ElementUI)

Vue.config.productionTip = false
/* eslint-disable no-new */
const vue = new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

export default vue
