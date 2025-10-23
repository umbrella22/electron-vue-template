<template>
  <div class="flex flex-row mt-8 w-full">
    <Tabs
      direction="vertical"
      :tabs
      @tab-changed="changeView"
      :config="tabsConfig"
    />
    <div class="content flex-1 rounded-tl-lg border border-slate-300">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Tabs from '@renderer/components/tabs/tab-index.vue'
import { i18nt } from '@renderer/i18n'
import { computed } from 'vue'

const tabs = computed(() => Object.values(i18nt.value.layout.tabs) as string[])
const tabsConfig = computed(() => ({
  primaryColor: '#3f76fc',
  bgColor: '#F2F3F5',
  activeBg: '#FFFFFF',
  borderRadius: '2px',
  width: '100%',
}))

const changeView = (item: string) => {
  console.log('切换到:', item)
}
</script>

<style scoped lang="scss">
.content {
  background-color: var(--main-view-bg-color);
}
</style>
