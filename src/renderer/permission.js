/* eslint-disable no-tabs */
import router from './router'
import store from './store'
import { Message } from 'element-ui'
import Performance from '@/tools/performance'

const whiteList = ['/login'] // 不重定向白名单
var end = null

router.beforeEach((to, from, next) => {
  end = Performance.startExecute(`${from.path} => ${to.path} 路由耗时`) /// 路由性能监控
  if (store.getters.token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (store.getters.roles.length === 0) {
        store.dispatch('GetInfo').then(res => { // 拉取用户信息
          next()
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/login')
    }
  }
  setTimeout(() => {
    end()
  }, 0)
})

router.afterEach(() => { })
