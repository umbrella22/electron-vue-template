import Vue from 'vue'
import Router from 'vue-router'
// 模板
import Layout from '../layout'
Vue.use(Router)
/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/

/**
 * hidden: true                 如果在模板中使用该选项,则不会在侧栏显示该路由(例如：Dashboard),如果是在第一个子路由中使用,侧栏则只显示第一个子路由的名字和图标(例如: Form)
 * alwaysShow: true             如果设置为true它则会始终显示根菜单,无视自路由长度,没有设置的话,就会折叠起来(不清楚为什么没有作用,可能是我写错位置了?)
 * redirect: noredirect         若设置为noredirect则顶部面包屑不能够为其重定向.
 * name:'router-name'           路由名称,此项为必须填写项
 * meta : {
    title: 'title'               这里的名字决定了面包屑和侧栏的名字
    icon: 'svg-name'             当你在svg文件夹内加入了你的图标,那么在这里填写图标名他就会显示在侧栏
  }
 **/

export default new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      name: 'Dashboard',
      hidden: true,
      children: [{
        path: 'dashboard',
        component: () => import('@/components/LandingPage')
      }]
    },

    {
      path: '/form',
      component: Layout,
      children: [
        {
          path: 'index',
          name: 'Form',
          component: () => import('@/views/form/index'),
          meta: { title: '表单', icon: 'form' }
        }
      ]
    },

    { path: '*', redirect: '/404', hidden: true }
  ]
})
