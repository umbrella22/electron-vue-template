import router from './router'
import store from './store'
import Performance from '@/tools/performance'

var end = null
const whiteList = ['/login'] // 不重定向白名单
router.beforeEach(async (to, from, next) => {
  end = Performance.startExecute(`${from.path} => ${to.path} 路由耗时`) /// 路由性能监控

  if (store.getters.token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0;

      if (hasRoles && store.getters.permission_routes.length > 0) {
        next()
      } else {
        try {
          const { roles } = await store.dispatch('GetUserInfo')
          const accessRoutes = await store.dispatch('GenerateRoutes', roles)
          router.addRoutes(accessRoutes)
          next({ ...to, replace: true })
        } catch (error) {
          await store.dispatch('LogOut')
          console.log(error)
          next('/login')
        }
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
