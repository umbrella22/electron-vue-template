import { defineStore } from "pinia"

// 需要在头部传入路由表并且在用户登录的时候进行此操作
// 引入路由表
import { constantRouterMap, asyncRoutes } from '@/router'

/**
 * 通过meta.role判断是否与当前用户权限匹配，此处也可以根据自己的需求进行修改。比如按位与
 * @param roles  权限
 * @param route  总的路由表
 */
function hasPermission(roles, route) {
    if (route.meta && route.meta.roles) {
        console.log(route.meta, roles.some(role => route.meta.roles.includes(role)))
        return roles.some(role => route.meta.roles.includes(role))
    } else {
        return true
    }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes   需要筛选的路由表
 * @param roles    权限
 */
function filterAsyncRouter(routes, roles) {
    const res = []

    routes.forEach(route => {
        const tmp = { ...route }

        if (hasPermission(roles, tmp)) {
            if (tmp.children) {
                tmp.children = filterAsyncRouter(tmp.children, roles)
            }
            res.push(tmp)
        }
    })
    return res
}

export const usePermissionStore = defineStore({
    id: 'permission',
    state: () => ({
        routers: [],
    }),
    actions: {
        GenerateRoutes(roles) {
            return new Promise(resolve => {
                let accessedRouters = []
                // 在这里当是管理员权限时,就给予所有的路由表
                if (roles === 'admin') {
                    accessedRouters = asyncRoutes
                } else {
                    accessedRouters = filterAsyncRouter(asyncRoutes, roles)
                }
                this.routers = constantRouterMap.concat(accessedRouters)
                resolve(this.routers)
            })
        },
        ResetRoutes() {
            return new Promise(resolve => {
                this.routers = []
                resolve()
            })
        }
    },
})
