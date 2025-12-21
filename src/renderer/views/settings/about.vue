<template>
  <div class="about-page fade-up">
    <div class="header-section">
      <div class="logo-container">
        <div :class="[logoIcon, 'logo-icon']"></div>
      </div>
      <h1 class="app-title">{{ i18nt.about.appTitle }}</h1>
      <div class="version-tag">v1.0.0</div>
    </div>

    <div class="content-section">
      <n-card :title="i18nt.about.system" size="small">
        <SystemInfoMation />
      </n-card>

      <div class="description">
        <p>
          {{ i18nt.about.description }}
        </p>
      </div>
    </div>

    <div class="footer-section">
      <p class="copyright">
        {{ i18nt.about.copyright }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import SystemInfoMation from '@renderer/components/system-info/system-info-mation.vue'
import { NCard } from 'naive-ui'
import { computed } from 'vue'
import { i18nt } from '@renderer/i18n'

const { systemInfo } = window
const logoIcon = computed(() => {
  const platform = systemInfo?.platform || 'win32'
  switch (platform) {
    case 'darwin':
      return 'i-tdesign-logo-apple'
    case 'win32':
      return 'i-tdesign-logo-windows'
    case 'linux':
      return 'i-tdesign-laptop'
    default:
      return 'i-tdesign-logo-windows'
  }
})
</script>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 80px;
  color: var(--primary-color);
}

.app-title {
  font-family: var(--font-code);
  font-size: 32px;
  margin: 0;
  color: var(--text-color);
}

.version-tag {
  display: inline-block;
  margin-top: 10px;
  padding: 4px 12px;
  background: var(--surface-variant);
  border-radius: 12px;
  font-size: 14px;
  color: var(--secondary-color);
  border: 1px solid var(--border-light);
}

.content-section {
  width: 100%;
  max-width: 500px;
  margin-bottom: 40px;
}

.description {
  margin-top: 20px;
  text-align: center;
  color: var(--secondary-color);
  line-height: 1.6;
}

.footer-section {
  text-align: center;
  color: var(--disabled-color);
  font-size: 12px;
}

.fade-up {
  animation: fadeUp 0.5s ease-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
