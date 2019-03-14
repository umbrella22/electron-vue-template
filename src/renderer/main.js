import Vue from 'vue'

import App from './App'
import router from './router'
import store from './store'
// 引用nedb做本地存储
import db from './utils/db'
// 引用element
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.use(ElementUI)

Vue.config.productionTip = false
Vue.prototype.$db = db
/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
