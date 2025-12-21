<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-main">PRTS</div>
      <div class="brand-sub">NEURAL NETWORK</div>
    </div>
    <nav class="nav">
      <div
        v-for="(item, idx) in nav"
        :key="item.code"
        class="nav-item"
        :class="{ active: activeNav === idx }"
        @click="selectNav(idx)"
      >
        <span class="nav-icon">{{ item.code }}</span> {{ item.label }}
      </div>
    </nav>
    <div class="sidebar-footer">
      <div style="font-family: var(--font-code); font-size: 10px; margin-bottom: 5px; color:#666;">SYS_STATUS</div>
      <div class="loader-bar"></div>
    </div>
  </aside>
</template>

<script setup lang="ts">

interface NavItem {
  code: string
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
.sidebar {
  grid-row: 1 / -1;
  background: var(--glass-strong);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  z-index: 2;
  padding: 30px 0;
  height: 100%;
}
.brand { padding: 0 30px; margin-bottom: 40px; }
.brand-main {
  font-family: var(--font-code);
  font-weight: 900;
  font-size: 32px;
  letter-spacing: -1px;
  color: var(--primary);
  position: relative;
  display: inline-block;
}
.brand-main::after {
  content: '';
  position: absolute;
  top: 4px; right: -12px;
  width: 6px; height: 6px;
  background: var(--success);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--success);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { opacity: 0.5; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.5; transform: scale(0.8); }
}
.brand-sub { font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin-top: 4px; }

.nav { display: flex; flex-direction: column; gap: 5px; width: 100%; }
.nav-item {
  position: relative; height: 48px; display: flex; align-items: center; padding: 0 30px; cursor: pointer;
  color: var(--secondary); font-family: var(--font-ui); font-weight: 600; font-size: 14px; letter-spacing: 0.5px;
  transition: all 0.3s ease;
}
.nav-item::after {
  content: ''; position: absolute; left: 10px; right: 10px; top: 4px; bottom: 4px; background: rgba(0, 0, 0, 0.04);
  border-radius: 4px; opacity: 0; transform: scaleX(0.9); transition: all 0.2s ease; z-index: -1;
}
.nav-item:hover { color: var(--primary); padding-left: 36px; }
.nav-item:hover::after { opacity: 1; transform: scaleX(1); }
.nav-item.active { color: var(--primary); background: linear-gradient(90deg, rgba(0, 0, 0, 0.05), transparent); }
.nav-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--primary); transform: scaleY(0); transition: transform 0.2s ease; }
.nav-item.active::before { transform: scaleY(1); }
.nav-icon { margin-right: 12px; font-family: var(--font-code); font-size: 10px; opacity: 0.5; }

.sidebar-footer { margin-top: auto; padding: 0 30px; opacity: 0.4; }
.loader-bar { height: 2px; width: 40px; background: #ccc; position: relative; overflow: hidden; }
.loader-bar::after { content: ''; position: absolute; top: 0; left: 0; height: 100%; width: 100%; background: var(--primary); animation: loadSlide 2s infinite ease-in-out; }
@keyframes loadSlide { 0% { transform: translateX(-100%); } 50% { transform: translateX(100%); } 100% { transform: translateX(100%); } }
</style>
