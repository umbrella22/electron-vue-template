<template>
  <scroll-bar>
    <el-menu
      mode="vertical"
      :show-timeout="200"
      :default-active="$route.path"
      background-color="#ffffff"
      text-color="#666666"
      :collapse="isCollapse"
      active-text-color="#ffffff"
    >
      <div class="title" :class="{minititle:isCollapse}">
        <!-- <svg-icon icon-class="logo" icon-name></svg-icon> -->
        <el-image>
          <div slot="error" class="image-slot">
            这是logo存放位置
          </div>
        </el-image>
      </div>
      <sidebar-item :routes="routes"></sidebar-item>
    </el-menu>
  </scroll-bar>
</template>

<script>
import { mapGetters } from "vuex";
import SidebarItem from "./SidebarItem";
import ScrollBar from "@/components/ScrollBar";

export default {
  components: { SidebarItem, ScrollBar },
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