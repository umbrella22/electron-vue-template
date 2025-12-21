<template>
  <div class="sub-sidebar">
    <div class="header">
      <n-input
        v-model:value="searchValue"
        :placeholder="searchPlaceholder"
        clearable
      >
        <template #prefix>
          <div class="i-tdesign-search text-lg text-gray-500" />
        </template>
      </n-input>
    </div>
    <div class="list-content">
      <div class="list-title">{{ title }}</div>
      <div class="list-items">
        <div
          v-for="(item, idx) in filteredItems"
          :key="idx"
          class="list-item"
          :class="{ active: activeId === item.id }"
          @click="$emit('select', item)"
        >
          <n-avatar size="large" class="item-avatar">
            <n-icon>
              <div :class="item.avatar" class="text-base" />
            </n-icon>
          </n-avatar>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-desc">{{ item.desc }}</div>
          </div>
          <div class="item-time">{{ item.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NAvatar, NIcon } from 'naive-ui'

interface ListItem {
  id?: string
  avatar: string
  name: string
  desc: string
  time: string
}

const props = defineProps<{
  title: string
  items: ListItem[]
  searchPlaceholder?: string
  activeId?: string
}>()

defineEmits<{
  (e: 'select', item: ListItem): void
}>()

const searchValue = ref('')

const filteredItems = computed(() => {
  if (!searchValue.value) return props.items
  return props.items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchValue.value.toLowerCase()),
  )
})
</script>

<style scoped>
.sub-sidebar {
  grid-row: 1 / -1;
  background: var(--glass-strong);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  z-index: 2;
  height: 100%;
  backdrop-filter: blur(10px);
}

.header {
  padding: 20px;
  /* padding-top: 40px;  Account for title bar if needed, handled by parent padding */
}

.list-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.list-title {
  padding: 0 20px 10px;
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--secondary-color);
  letter-spacing: 2px;
  font-weight: bold;
}

.list-items {
  display: flex;
  flex-direction: column;
}

.list-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.list-item:hover {
  background: var(--glass);
}

.list-item.active {
  background: var(--glass-strong);
  border-left-color: var(--primary-color);
  box-shadow: inset 4px 0 8px -4px rgba(46, 125, 50, 0.3);
}

.item-avatar {
  width: 36px;
  height: 36px;
  font-size: 14px;
  margin-right: 12px;
  font-family: var(--font-code);
  color: #fff;
}

.item-info {
  flex: 1;
  overflow: hidden;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
}

.item-desc {
  font-size: 11px;
  color: var(--secondary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  font-size: 10px;
  color: var(--secondary-color);
  font-family: var(--font-code);
}
</style>
