<template>
  <div class="app-wrapper" :class="classObj">
    <navbar></navbar>
    <div class="container-set">
      <sidebar class="sidebar-container"></sidebar>
      <div class="main-container">
        <app-main></app-main>
      </div>
    </div>
  </div>
</template>

<script>
import { Sidebar, AppMain, Navbar } from "./components";
import ResizeMixin from "./mixin/ResizeHandler";

export default {
  name: "layout",
  components: {
    Sidebar,
    AppMain,
    Navbar
  },
  mixins: [ResizeMixin],
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar;
    },
    device() {
      return this.$store.state.app.device;
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened
      };
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "@/styles/mixin.scss";
.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  top: 38px;
  .container-set {
    position: relative;
    padding-top: 62px;
  }
}
</style>
