<template>
  <div class="bg-body">
    <div class="sys-window active">
      <div class="deco-grid"></div>

      <!-- Column 1: Icon Navigation -->
      <IconSidebar
        :nav="navItems"
        v-model:activeNav="activeNav"
        @change="changeView"
      />

      <!-- Column 2: List Navigation (Context Aware) -->
      <SubSidebar
        :title="currentTabName"
        :items="currentListItems"
        :search-placeholder="searchPlaceholder"
        :active-id="activeSubItem"
        @select="handleSubItemSelect"
      />

      <!-- Column 3: Main Content -->
      <div class="content-wrapper">
        <div class="main-area">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import IconSidebar from '@renderer/layout/icon-sidebar.vue'
import SubSidebar from '@renderer/layout/sub-sidebar.vue'
import { i18nt } from '@renderer/i18n'
import { useToolsStore } from '@renderer/store/modules/tools'
import { useDownloadStore } from '@renderer/store/modules/download'

const router = useRouter()
const route = useRoute()
const activeNav = ref(0)
const toolsStore = useToolsStore()
const downloadStore = useDownloadStore()

const navItems = computed(() => [
  {
    avatar: 'i-tdesign-tools',
    label: i18nt.value.layout.tabs.tools.toUpperCase(),
    route: 'tools',
  },
  {
    avatar: 'i-tdesign-download',
    label: i18nt.value.layout.tabs.download.toUpperCase(),
    route: 'download',
  },
  {
    avatar: 'i-tdesign-setting',
    label: i18nt.value.layout.tabs.settings.toUpperCase(),
    route: 'settings',
  },
])

const currentTabName = computed(() => {
  return navItems.value[activeNav.value]?.label || i18nt.value.layout.unknown
})

const searchPlaceholder = computed(() => {
  return `${i18nt.value.layout.sidebar.searchPrefix} ${currentTabName.value}`
})

// Mock data for the SubSidebar based on current view
const currentListItems = computed(() => {
  const current = navItems.value[activeNav.value]?.route
  switch (current) {
    case 'tools':
      return [
        {
          id: 'console',
          avatar: 'i-tdesign-code',
          name: i18nt.value.buttons.console,
          desc: i18nt.value.layout.sidebar.tools.debugTools,
          time: i18nt.value.layout.sidebar.status.ready,
        },
        {
          id: 'check-update',
          avatar: 'i-tdesign-refresh',
          name: i18nt.value.buttons.checkUpdate,
          desc: i18nt.value.layout.sidebar.tools.checkUpdates,
          time: i18nt.value.layout.sidebar.status.idle,
        },
        {
          id: 'check-update-2',
          avatar: 'i-tdesign-refresh',
          name: i18nt.value.buttons.checkUpdate2,
          desc: i18nt.value.layout.sidebar.tools.alternativeMethod,
          time: i18nt.value.layout.sidebar.status.idle,
        },
        {
          id: 'check-update-inc',
          avatar: 'i-tdesign-download',
          name: i18nt.value.buttons.checkUpdateInc,
          desc: i18nt.value.layout.sidebar.tools.incremental,
          time: i18nt.value.layout.sidebar.status.idle,
        },
        {
          id: 'crash-sim',
          avatar: 'i-tdesign-error-circle',
          name: i18nt.value.buttons.simulatedCrash,
          desc: i18nt.value.layout.sidebar.tools.testErrorHandling,
          time: i18nt.value.layout.sidebar.status.ready,
        },
        {
          id: 'open-window',
          avatar: 'i-tdesign-window',
          name: i18nt.value.buttons.openNewWindow,
          desc: i18nt.value.layout.sidebar.tools.newWindow,
          time: i18nt.value.layout.sidebar.status.ready,
        },
        {
          id: 'browser',
          avatar: 'i-tdesign-internet',
          name: i18nt.value.buttons.browser || 'Browser',
          desc: i18nt.value.layout.sidebar.tools.webBrowserDemo,
          time: i18nt.value.layout.sidebar.status.ready,
        },
        {
          id: 'print',
          avatar: 'i-tdesign-printer',
          name: i18nt.value.print?.print || 'Print',
          desc: i18nt.value.layout.sidebar.tools.printDemo,
          time: i18nt.value.layout.sidebar.status.ready,
        },
      ]
    case 'download':
      return [
        {
          id: 'all',
          avatar: 'i-tdesign-download',
          name: i18nt.value.download.filters.all,
          desc: i18nt.value.download.filters.allDesc,
          time: '',
        },
        {
          id: 'active',
          avatar: 'i-tdesign-play-circle',
          name: i18nt.value.download.filters.active,
          desc: i18nt.value.download.filters.activeDesc,
          time: '',
        },
        {
          id: 'completed',
          avatar: 'i-tdesign-check-circle',
          name: i18nt.value.download.filters.completed,
          desc: i18nt.value.download.filters.completedDesc,
          time: '',
        },
      ]
    case 'settings':
      return [
        {
          id: 'general',
          avatar: 'i-tdesign-setting',
          name: i18nt.value.layout.sidebar.settings.general,
          desc: i18nt.value.layout.sidebar.settings.generalDesc,
          time: '',
        },
        {
          id: 'about',
          avatar: 'i-tdesign-info-circle',
          name: i18nt.value.layout.sidebar.settings.about,
          desc: i18nt.value.layout.sidebar.settings.aboutDesc,
          time: '',
        },
      ]
    default:
      return []
  }
})

const activeSubItem = computed(() => {
  if (navItems.value[activeNav.value]?.route === 'tools') {
    return toolsStore.activeToolId
  }
  if (navItems.value[activeNav.value]?.route === 'download') {
    return downloadStore.filter
  }
  if (navItems.value[activeNav.value]?.route === 'settings') {
    return router.currentRoute.value.name as string
  }
  return undefined
})

const handleSubItemSelect = (item: any) => {
  if (navItems.value[activeNav.value]?.route === 'tools' && item.id) {
    toolsStore.setActiveTool(item.id)
  }
  if (navItems.value[activeNav.value]?.route === 'download' && item.id) {
    downloadStore.setFilter(item.id)
  }
  if (navItems.value[activeNav.value]?.route === 'settings' && item.id) {
    router.push({ name: item.id })
  }
}

const changeView = (item: any) => {
  console.log(item)
  if (item && item.route) {
    router.push({ name: item.route })
  }
}

// Sync activeNav with current route
watch(
  () => route.name,
  (newVal) => {
    const idx = navItems.value.findIndex((item) => {
      return item.route === newVal
    })
    if (idx !== -1) {
      activeNav.value = idx
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* PRTS Design System Variables - Now managed in them.scss */

.bg-body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: var(--background-gradient, var(--background-color));
  font-family: var(--font-ui);
  color: var(--text-color);
  overflow: hidden;
  padding-top: 30px; /* Account for custom title bar */
  box-sizing: border-box;
}

.sys-window {
  height: 100%;
  width: 100%;
  position: relative;
  background: var(--glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: grid;
  grid-template-columns: 60px 240px 1fr; /* 3-Column Layout */
  grid-template-rows: 1fr;
  overflow: hidden;
}

.deco-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(var(--border-light) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-light) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
}

.content-wrapper {
  grid-column: 3;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 2;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 64px;
  border-bottom: 1px solid var(--border-light);
  background: var(--glass);
  z-index: 2;
}
.path-display {
  font-family: var(--font-code);
  font-size: 12px;
  color: var(--secondary-color);
  letter-spacing: 1px;
}

.main-area {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  z-index: 2;
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
