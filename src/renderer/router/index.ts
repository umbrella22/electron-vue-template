import { createRouter, createWebHashHistory } from "vue-router";
// 引入路由表
import routerMap from "./constantRouterMap";

export default createRouter({
  history: createWebHashHistory(),
  routes: routerMap,
});
