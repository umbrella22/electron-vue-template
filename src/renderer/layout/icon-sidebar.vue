<template>
  <div class="icon-sidebar">
    <div class="brand">
      <div class="brand-logo">I</div>
    </div>
    <nav class="nav">
      <div
        v-for="(item, idx) in nav"
        :key="item.route"
        class="nav-item"
        :class="{ active: activeNav === idx }"
        @click="selectNav(idx)"
        :title="item.label"
      >
        <div class="nav-icon" :class="item.avatar"></div>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="status-dot"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NavItem {
  avatar: string
  route: string
  label: string
}

const props = defineProps<{
  nav: NavItem[]
  activeNav: number
}>()

const emit = defineEmits<{
  (e: 'update:activeNav', value: number): void
  (e: 'change', value: NavItem): void
}>()

const selectNav = (idx: number) => {
  emit('update:activeNav', idx)
  emit('change', props.nav[idx])
}
</script>

<style scoped>
.icon-sidebar {
  grid-row: 1 / -1;
  background: var(--glass-strong);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
  padding: 20px 0;
  height: 100%;
  width: 100%;
}

.brand {
  margin-bottom: 30px;
}
.brand-logo {
  font-family: var(--font-code);
  font-weight: 900;
  font-size: 24px;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  filter: var(--glow-component);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  align-items: center;
}
.nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  color: var(--secondary);
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: var(--border-light);
  color: var(--primary-color);
}

.nav-item.active {
  background: var(--primary-color);
  color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  filter: var(--glow-component);
}

.nav-icon {
  font-family: var(--font-code);
  font-weight: bold;
  font-size: 12px;
}

.sidebar-footer {
  margin-top: auto;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  box-shadow: 0 0 5px var(--success);
}
</style>
