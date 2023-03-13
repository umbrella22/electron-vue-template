import type { RouteRecordRaw } from "vue-router";
const Notfound = () => import("@renderer/views/404.vue");
const routes: Array<RouteRecordRaw> = [
  // 最后一个*，它意味着重复的参数，如果您打算使用它的名称直接导航到未找到的路由，那么这是必要的
  { path: "/:pathMatch(.*)*", name: "not-found", component: Notfound },

  // 如果你省略了最后一个' * '，参数中的' / '字符将在解析或推入时被编码
  { path: "/:pathMatch(.*)", name: "bad-not-found", component: Notfound },
  {
    path: "/",
    name: "总览",
    component: () => import("@renderer/components/LandingPage.vue"),
  },
];

export default routes;
