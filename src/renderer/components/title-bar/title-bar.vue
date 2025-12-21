<template>
  <div class="window-title" :class="{ 'is-mac': !isNotMac }">
    <!-- MacOS traffic lights placeholder or custom positioning -->
    <div v-if="!isNotMac" class="mac-traffic-lights-placeholder"></div>

    <!-- 软件logo预留位置 (Only show on Windows/Linux or if desired) -->
    <div v-if="isNotMac && !IsWeb" style="-webkit-app-region: drag" class="logo">
      <img
        src="@renderer/assets/icons/svg/electron-logo.svg"
        class="icon-logo"
      />
    </div>
    
    <!-- 中间标题位置 -->
    <div style="-webkit-app-region: drag" class="title">
      <SystemInformation :compact="true" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SystemInformation from '@renderer/components/system-info/system-info-mation.vue'

const { systemInfo } = window

const isNotMac = ref(systemInfo.platform !== 'darwin')
const IsWeb = ref(!window.ipcRendererChannel)

</script>

<style scoped>
.window-title {
  width: 100%;
  height: 32px; /* Slightly taller for PRTS look */
  line-height: 32px;
  background-color: transparent; /* Transparent for glass effect */
  display: flex;
  -webkit-app-region: drag;
  position: fixed;
  top: 0;
  z-index: 99999;
  align-items: center;
}

.mac-traffic-lights-placeholder {
  width: 70px; /* Reserve space for traffic lights */
  height: 100%;
  -webkit-app-region: drag;
}

.icon-logo {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.title {
  text-align: center;
  color: var(--text-color);
  flex: 1;
  font-family: var(--font-code, "Courier New", monospace);
  font-weight: bold;
  font-size: 12px;
  letter-spacing: 2px;
}

.logo {
  margin: 0 10px;
  color: var(--text-color);
}

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
}

.windows-icon-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-app-region: no-drag;
  height: 100%;
  width: 46px;
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.2s;
}

.icon-size {
  width: 12px;
  height: 12px;
  fill: currentColor;
}

.windows-icon-bg:hover {
  background-color: var(--border-light);
}

.close-icon:hover {
  background-color: #c42b1c;
  color: #fff;
}
</style>
