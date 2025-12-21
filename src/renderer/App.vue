<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="themeOverrides"
    :hljs="hljs"
  >
    <n-global-style />
    <n-message-provider>
      <title-bar />
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import TitleBar from '@renderer/components/title-bar/title-bar.vue'
import { onMounted, computed, ref, nextTick } from 'vue'
import { invoke } from '@renderer/utils/ipcRenderer'
import { useThemeStore } from '@renderer/store/modules/theme'
import {
  NConfigProvider,
  NGlobalStyle,
  NMessageProvider,
  darkTheme,
  GlobalThemeOverrides,
} from 'naive-ui'
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'

hljs.registerLanguage('typescript', typescript)

const themeStore = useThemeStore()

const theme = computed(() => (themeStore.isDark ? darkTheme : null))

const themeOverrides = computed<GlobalThemeOverrides>(() => {
  const primaryColor = themeStore.isDark ? '#00e676' : '#409eff'
  const textColor = themeStore.isDark ? '#e0e0e0' : '#333333'
  const bodyColor = themeStore.isDark ? '#050505' : '#f2f3f5'

  return {
    common: {
      primaryColor: primaryColor,
      primaryColorHover: primaryColor,
      primaryColorPressed: primaryColor,
      textColorBase: textColor,
      bodyColor: bodyColor,
    },
  }
})

onMounted(() => {
  invoke('win-ready')
  themeStore.updateTheme()
})
</script>

<style>
body {
  background-color: var(--background-color);
}
</style>
