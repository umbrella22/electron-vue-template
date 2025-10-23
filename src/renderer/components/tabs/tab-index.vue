<template>
  <div
    class="nav-container"
    :class="{ 'is-vertical': props.direction === 'vertical' }"
    :style="{
      '--active-bg': getTabConfigs.activeBg,
      '--border-radius': getTabConfigs.borderRadius,
      '--width': getTabConfigs.width,
    }"
  >
    <ul ref="tabsContainer" class="nav-tabs">
      <li
        v-for="(tab, index) in tabs"
        :key="index"
        :ref="(el) => setTabRef(el, index)"
        class="tab-item"
        :class="{ active: activeIndex === index }"
        @click="switchTab(index)"
      >
        {{ tab }}
      </li>
      <div class="highlight-bar" :style="highlightStyle" />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface TabConfig {
  primaryColor?: string
  bgColor?: string
  activeBg?: string
  borderRadius?: string
  width?: string
}

interface Props {
  modelValue?: number
  tabs?: string[]
  config?: TabConfig
  direction?: 'horizontal' | 'vertical'
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'tab-changed', tab: string): void
}

// Props
const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  tabs: () => ['选项一', '选项二', '选项三'],
  config: () => ({
    primaryColor: '#3f76fc',
    bgColor: '#F2F3F5',
    activeBg: '#FFFFFF',
    borderRadius: '2px',
    width: '100%',
  }),
  direction: 'horizontal',
})

// Emits
const emit = defineEmits<Emits>()

// Refs
const tabsContainer = ref<HTMLUListElement>()
const tabRefs = ref<(HTMLLIElement | null)[]>([])
const activeIndex = ref(0)
const highlightStyle = ref({
  width: '0px',
  height: '0px',
  transform: 'translateX(0)',
})

// Computed
const getTabConfigs = computed(() => {
  return Object.assign(
    {
      activeBg: '#FFFFFF',
      borderRadius: '2px',
      width: '100%',
    },
    props.config,
  )
})

// Methods
const setTabRef = (el: any, index: number) => {
  if (el) {
    tabRefs.value[index] = el as HTMLLIElement
  }
}

const switchTab = (index: number) => {
  let timer: NodeJS.Timeout | null = null
  activeIndex.value = index

  nextTick(() => {
    calculatePosition()
    emit('tab-changed', props.tabs[index])
    emit('update:modelValue', index)

    if (timer) {
      clearTimeout(timer)
    }
    // 用于改变宽度以后，重新计算位置
    timer = setTimeout(() => {
      calculatePosition()
    }, 10)
  })
}

const calculatePosition = () => {
  const activeTab = tabRefs.value[activeIndex.value]
  if (!activeTab || !tabsContainer.value) return

  const tabRect = activeTab.getBoundingClientRect()
  const containerRect = tabsContainer.value.getBoundingClientRect()

  if (props.direction === 'vertical') {
    highlightStyle.value = {
      width: `calc(100% - 8px)`,
      height: `${tabRect.height}px`,
      transform: `translateY(${tabRect.top - containerRect.top}px)`,
    }
  } else {
    highlightStyle.value = {
      width: `${tabRect.width}px`,
      height: '100%',
      transform: `translateX(${tabRect.left - containerRect.left}px)`,
    }
  }
}

const handleResize = () => {
  calculatePosition()
}

// Watch modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    const foundIndex = props.tabs.findIndex((tab, index) => index === newValue)
    activeIndex.value = foundIndex !== -1 ? foundIndex : 0
    nextTick(() => {
      calculatePosition()
    })
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  calculatePosition()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.nav-container {
  position: relative;
  background: var(--background-color);
  padding: 8px 4px;
  border-radius: 4px;
  user-select: none;
  width: var(--width);
}

.nav-container.is-vertical {
  width: fit-content;
}

.nav-tabs {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.nav-container.is-vertical .nav-tabs {
  flex-direction: column;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 5px 12px;
  color: #666;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: color 0.3s;
}

.tab-item.active {
  color: var(--primary-color);
  font-weight: 500;
}

.highlight-bar {
  position: absolute;
  top: 0;
  left: 0;
  background: var(--active-bg);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-container.is-vertical .highlight-bar {
  left: 4px;
  top: 1px;
}
</style>
