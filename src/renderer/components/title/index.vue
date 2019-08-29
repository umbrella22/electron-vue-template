<!--  -->
<template>
  <div class="title">
    <!-- 软件logo预留位置 -->
    <div style="-webkit-app-region: drag;"></div>
    <!-- 菜单栏位置 -->
    <div ></div>
    <!-- 中间标题位置 -->
    <div style="-webkit-app-region: drag;"></div>
    <div class="controls-container">
      <div class="windows-icon-bg">
        <svg-icon icon-class="mini"></svg-icon>
      </div>
      <div class="windows-icon-bg">
        <svg-icon v-if="mix" icon-class="mix"></svg-icon>
        <svg-icon v-else icon-class="mini"></svg-icon>
      </div>
      <div class="windows-icon-bg">
        <svg-icon icon-class="close"></svg-icon>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    mix: false
  }),

  components: {},

  mounted() {},

  methods: {}
};
</script>
<style rel='stylesheet/scss' lang='scss' scoped>
.title {
  width: 100%;
  height: 40px;
  background-color: #ffffff;
  color: rgba(60, 60, 60, 0.6);
  .controls-container {
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    text-align: center;
    position: relative;
    z-index: 3000;
    -webkit-app-region: no-drag;
    height: 100%;
    width: 138px;
    margin-left: auto;
    .windows-icon-bg {
      display: inline-block;
      -webkit-app-region: no-drag;
      height: 100%;
      width: 33.34%;
    }
  }
}
</style>