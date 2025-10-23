<template>
  <title-bar />
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script setup lang="ts">
import TitleBar from '@renderer/components/title-bar/title-bar.vue'
import { onMounted } from 'vue'

onMounted(() => {
  window.ipcRendererChannel.WinReady.invoke()
})
</script>

<style>
body {
  background-color: var(--background-color);
}
</style>
