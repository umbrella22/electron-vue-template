<template>
  <div :class="['system-info', { 'is-compact': compact }]">
    <!-- Compact Mode: Horizontal Static Line -->
    <div v-if="compact" class="items compact-row">
      <span class="item" v-for="(item, index) in tips" :key="index">
        <span class="name">{{ item.name }}</span>
        <span class="value">{{ item.value }}</span>
        <span v-if="index < tips.length - 1" class="separator">/</span>
      </span>
    </div>

    <!-- Normal Mode: Vertical List -->
    <div v-else class="items">
      <div class="item" v-for="(item, index) in tips" :key="index">
        <div class="name" v-text="item.name" />
        <div class="value" v-text="item.value" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { i18nt } from '@renderer/i18n'
import { computed, ref } from 'vue'

const props = defineProps<{
  compact?: boolean
}>()

const { systemInfo } = window

let tips = ref(
  computed(() => [
    { name: 'LANG', value: i18nt.value.about.languageValue },
    { name: 'OS', value: systemInfo.platform.toUpperCase() },
    { name: 'VER', value: systemInfo.release },
    { name: 'ARCH', value: systemInfo.arch.toUpperCase() },
  ]),
)
</script>

<style scoped lang="scss">
.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-top: 10px;
}

.items {
  margin-top: 8px;
}

/* Normal Item Styles */
.items:not(.compact-row) .item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  line-height: 24px;

  .name {
    color: #6a6a6a;
    margin-right: 6px;
  }

  .value {
    color: #35495e;
    font-weight: bold;
  }
}

/* Compact Static Styles */
.system-info.is-compact {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compact-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  white-space: nowrap;

  .item {
    display: inline-flex;
    align-items: center;
    font-family: 'Courier New', monospace;
    font-size: 10px;
    color: #666;

    .name {
      color: #999;
      margin-right: 4px;
      font-weight: normal;
    }

    .value {
      color: #333;
      font-weight: bold;
    }

    .separator {
      margin-left: 12px;
      color: #ddd;
    }
  }
}
</style>
