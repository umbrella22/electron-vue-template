<template>
  <scroll-bar>
    <el-menu mode="vertical" :show-timeout="200" :default-active="$route.path" :collapse="isCollapse">
      <Logo :collapse="isCollapse" />
      <sidebar-item v-for="route in routes_list" :key="route.name" :item="route" :base-path="route.path"
        :collapse="isCollapse"></sidebar-item>
    </el-menu>
  </scroll-bar>
</template>

<script setup>
import { computed, defineComponent } from "vue";
import SidebarItem from "./SidebarItem";
import ScrollBar from "@/components/ScrollBar";
import Logo from "./logo";
import { useAppStore } from "@/store/app"
import { usePermissionStore } from "@/store/permission"
defineComponent({
  name: 'Sidebar'
})
const { sidebarStatus } = useAppStore()
const { routers } = usePermissionStore()

const routes_list = computed(() => routers)

const isCollapse = computed(() => !sidebarStatus.opened)
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.title {
  text-align: center;
  line-height: 64px;
  height: 64px;
  font-size: 14px;
  font-weight: bold;
  color: #333333;
  background-color: #ffffff;
  padding: 0 20px;

  .logo-set {
    width: 21px;
    height: 21px;
  }
}

.minititle {
  padding: 0 10px;
  transition: padding 0.28s;
  overflow: hidden;
  width: 180px;
}
</style>