import router from './router'
import Performance from '@/tools/performance'
import { usePermissionStore } from "@/store/permission"
import { useUserStore } from "@/store/user"

export function usePermission() {
    let end = null
    const whiteList = ['/login'] // 不重定向白名单
    router.beforeEach(async (to, from, next) => {
        const { GenerateRoutes, routers } = usePermissionStore()
        const { GetUserInfo, token, roles, logOut } = useUserStore()
        end = Performance.startExecute(`${from.path} => ${to.path} 路由耗时`) /// 路由性能监控
        if (token) {
            if (to.path === '/login') {
                next({ path: '/' })
            } else {
                const hasRoles = roles && roles.length > 0;
                if (hasRoles && routers && routers.length > 0) {
                    next()
                } else {
                    try {
                        const roles = await GetUserInfo()
                        const accessRoutes = await GenerateRoutes(roles)
                        accessRoutes.forEach(item => {
                            router.addRoute(item)
                        })
                        next({ ...to, replace: true })
                    } catch (error) {
                        await logOut()
                        console.error(error)
                        next('/login')
                    }
                }

            }
        } else {
            if (whiteList.includes(to.path)) {
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
}
