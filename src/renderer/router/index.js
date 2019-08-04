import Vue from 'vue'
import Router from 'vue-router'
// 引入路由表
import routerMap from './constantRouterMap'

Vue.use(Router)

export default new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: routerMap
})
