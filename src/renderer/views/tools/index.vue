<template>
  <div class="tools-page">
    <div class="tool-header" v-if="currentTool">
      <div class="header-left">
        <n-avatar size="medium" :style="{ backgroundColor: 'var(--border-light)', color: 'var(--text-color)' }">
          <div :class="currentTool.avatar" class="text-lg" />
        </n-avatar>
        <div class="tool-title">{{ currentTool.name }}</div>
      </div>
      <n-button type="primary" @click="runTool">
        RUN FUNCTION
      </n-button>
    </div>

    <div class="code-container" v-if="currentTool">
      <div class="code-column">
        <n-card title="Main Process" size="small" class="code-card">
           <n-code :code="currentTool.mainCode" language="typescript" />
        </n-card>
      </div>
      <div class="code-column">
        <n-card title="Renderer Process" size="small" class="code-card">
           <n-code :code="currentTool.rendererCode" language="typescript" />
        </n-card>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <n-empty description="Select a tool from the sidebar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { i18nt } from '@renderer/i18n'
import { useToolsStore } from '@renderer/store/modules/tools'
import { invoke, IpcChannel } from '@renderer/utils/ipcRenderer'
import { NButton, NCard, NCode, NEmpty, NAvatar } from 'naive-ui'
import { createToolsData, ToolId } from './toolsData'

const toolsStore = useToolsStore()
const { crash } = window

const toolsData = computed(() => createToolsData({ i18nt, invoke, IpcChannel, crash }))

const currentTool = computed(() => {
  return toolsData.value[toolsStore.activeToolId as ToolId]
})

const runTool = () => {
  if (currentTool.value && currentTool.value.action) {
    currentTool.value.action()
  }
}
</script>

<style scoped>
.tools-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tool-title {
  font-family: var(--font-code);
  font-size: 18px;
  font-weight: bold;
}

.code-container {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.code-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.code-card {
  height: 100%;
  overflow: hidden;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  font-family: var(--font-code);
}
</style>
