import router from './router'
import Performance from '@renderer/utils/performance'

let end: Function | null = null
router.beforeEach((to, from, next) => {
  end = Performance.startExecute(`${from.path} => ${to.path} 路由耗时`) /// 路由性能监控
  next()
  setTimeout(() => {
    if (typeof end === 'function') end()
  }, 0)
})

router.afterEach(() => {})
