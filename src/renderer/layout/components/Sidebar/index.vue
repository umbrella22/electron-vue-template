<template>
  <scroll-bar>
    <el-menu
      mode="vertical"
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="isCollapse"
    >
      <Logo :collapse="isCollapse" />
      <sidebar-item v-for="route in routes" :key="route.name" :item="route" :base-path="route.path" :collapse="isCollapse"></sidebar-item>
    </el-menu>
  </scroll-bar>
</template>

<script>
import { mapGetters } from "vuex";
import SidebarItem from "./SidebarItem";
import ScrollBar from "@/components/ScrollBar";
import Logo from "./logo";

export default {
  components: { SidebarItem, ScrollBar, Logo },
  computed: {
    ...mapGetters(["sidebar"]),
    routes() {
      return this.$router.options.routes;
    },
    isCollapse() {
      return !this.sidebar.opened;
    }
  }
};
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