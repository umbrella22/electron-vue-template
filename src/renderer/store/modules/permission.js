// 需要在头部传入路由表并且在用户登录的时候进行此操作
// 引入路由表
import { constantRouterMap, asyncRoutes } from '@/router'
/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles  权限
 * @param route  总的路由表
 */
function hasPermission(roles, route) {
    if (route.meta && route.meta.roles) {
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

const permission = {
    state: {
        routers: [],
        addRouters: []
    },
    mutations: {
        SET_ROUTERS: (state, routers) => {
            state.addRouters = routers
            state.routers = constantRouterMap.concat(routers)
            console.log(state.routers)
        },
        RESET_ROUTERS: (state, routers) => {
            state.addRouters = routers
            state.routers = routers
        }
    },
    actions: {
        GenerateRoutes({ commit }, data) {
            return new Promise(resolve => {
                const roles = data
                let accessedRouters = []
                // 在这里当是管理员权限时,就给予所有的路由表
                if (roles === 'admin') {
                    accessedRouters = asyncRoutes || []
                } else {
                    // 根据需通过得到的权限于路由表中对比得到该用户应有的边栏
                    accessedRouters = filterAsyncRouter(asyncRoutes, roles)
                    // 根据产品类型再次处理路由表
                }
                commit('SET_ROUTERS', accessedRouters)
                resolve(accessedRouters)
            })
        },
        ResetRoutes({ commit }, data) {
            commit('RESET_ROUTERS', [])
        }
    }
}

export default permission
