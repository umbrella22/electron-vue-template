<template>
  <div class="settings-page fade-up">
    <div class="section-title">{{ i18nt.layout.tabs.settings }}</div>

    <n-card>
      <n-list hoverable>
        <n-list-item>
          <template #prefix>
            <div class="setting-label">{{ i18nt.about.language }}</div>
          </template>
          <template #suffix>
            <n-button size="small" @click="changeLanguage">
              {{ i18nt.buttons.changeLanguage }}
            </n-button>
          </template>
          <div class="setting-desc">{{ i18nt.about.languageValue }}</div>
        </n-list-item>

        <n-list-item>
          <template #prefix>
            <div class="setting-label">{{ i18nt.settings.theme.label }}</div>
          </template>
          <template #suffix>
            <n-radio-group
              :value="themeStore.themeMode"
              size="small"
              @update:value="handleThemeChange"
            >
              <n-radio-button value="system">
                {{ i18nt.settings.theme.modes.system }}
              </n-radio-button>
              <n-radio-button value="light">
                {{ i18nt.settings.theme.modes.light }}
              </n-radio-button>
              <n-radio-button value="dark">
                {{ i18nt.settings.theme.modes.dark }}
              </n-radio-button>
            </n-radio-group>
          </template>
          <div class="setting-desc">
            {{ i18nt.settings.theme.current }} {{ currentThemeLabel }}
          </div>
        </n-list-item>
      </n-list>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { i18nt, setLanguage, globalLang } from '@renderer/i18n'
import { useThemeStore, ThemeMode } from '@renderer/store/modules/theme'
import {
  NCard,
  NList,
  NListItem,
  NButton,
  NRadioGroup,
  NRadioButton,
} from 'naive-ui'

const themeStore = useThemeStore()
const currentThemeLabel = computed(() => {
  return i18nt.value.settings.theme.modes[themeStore.themeMode]
})

function changeLanguage() {
  setLanguage(globalLang.value === 'zh-cn' ? 'en' : 'zh-cn')
}

function handleThemeChange(value: ThemeMode) {
  themeStore.setTheme(value)
}
</script>

<style scoped>
.section-title {
  font-family: var(--font-code);
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: var(--primary-color);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 10px;
}

.setting-label {
  font-weight: bold;
  font-size: 16px;
  color: var(--text-color);
  min-width: 100px;
}

.setting-desc {
  color: var(--secondary-color);
  font-size: 14px;
}
</style>
