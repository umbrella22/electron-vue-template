<!--  -->
<template>
  <div class="title">
    <!-- 软件logo预留位置 -->
    <div style="-webkit-app-region: drag;" class="logo"></div>
    <!-- 菜单栏位置 -->
    <div></div>
    <!-- 中间标题位置 -->
    <div style="-webkit-app-region: drag;">标题文字</div>
    <div class="controls-container">
      <div class="windows-icon-bg" @click="Mini">
        <svg-icon icon-class="mini" class-name="icon-size"></svg-icon>
      </div>
      <div class="windows-icon-bg" @click="MixOrReduction">
        <svg-icon v-if="mix" icon-class="reduction" class-name="icon-size"></svg-icon>
        <svg-icon v-else icon-class="mix" class-name="icon-size"></svg-icon>
      </div>
      <div class="windows-icon-bg close-icon" @click="Close">
        <svg-icon icon-class="close" class-name="icon-size"></svg-icon>
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

  methods: {
    
  }
};
</script>
<style rel='stylesheet/scss' lang='scss' scoped>
.title {
  width: 100%;
  height: 30px;
  line-height: 30px;
  background-color: #ffffff;
  color: rgba(60, 60, 60, 0.6);
  display: flex;
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
      .icon-size {
        width: 12px;
        height: 12px;
      }
    }
    .windows-icon-bg:hover {
      background-color: rgba(85, 85, 85, 0.2);
      color: #333;
    }
    .close-icon:hover {
      background-color: rgba(232, 17, 35, 0.9);
      color: #fff;
    }
  }
}
</style>