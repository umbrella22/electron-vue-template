import { defineStore } from 'pinia'
import { ref, watch, onUnmounted } from 'vue'
import { invoke, listen, IpcChannel } from '@renderer/utils/ipcRenderer'

export type ThemeMode = 'system' | 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const themeMode = ref<ThemeMode>('system')
  const isDark = ref(false)

  // 清理监听器的函数
  let cleanupThemeListener: (() => void) | null = null

  // Media query for system theme
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  /**
   * 应用主题到 DOM
   */
  const applyThemeToDOM = async () => {
    // Apply class to html element for UnoCSS dark mode
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('theme', 'light')
    }
    const style = getComputedStyle(document.documentElement)
    const light =
      (style.getPropertyValue('--titlebar-color-light') || '').trim() ||
      '#F2F3F5'
    const dark =
      (style.getPropertyValue('--titlebar-color-dark') || '').trim() ||
      '#050505'
    const symbolLight =
      (style.getPropertyValue('--titlebar-symbol-light') || '').trim() ||
      '#000000'
    const symbolDark =
      (style.getPropertyValue('--titlebar-symbol-dark') || '').trim() ||
      '#FFFFFF'
    if (window.ipcRendererChannel) {
      await invoke(IpcChannel.SetTitleBarOverlayColors, {
        light,
        dark,
        symbolLight,
        symbolDark,
      })
      await invoke(IpcChannel.SetTitleBarOverlay, { isDark: isDark.value })
    }
  }

  /**
   * 根据当前 themeMode 计算 isDark 并应用主题
   */
  const updateTheme = async () => {
    if (themeMode.value === 'system') {
      isDark.value = mediaQuery.matches
    } else {
      isDark.value = themeMode.value === 'dark'
    }
    await applyThemeToDOM()
  }

  /**
   * 设置主题并同步到所有窗口（通过主进程）
   */
  const setTheme = async (mode: ThemeMode) => {
    themeMode.value = mode
    // 通知主进程同步到所有窗口
    if (window.ipcRendererChannel) {
      await invoke(IpcChannel.SetTheme, { themeMode: mode })
    }
  }

  /**
   * 从主进程初始化主题状态
   */
  const initThemeFromMain = async () => {
    if (window.ipcRendererChannel) {
      try {
        const result = await invoke(IpcChannel.GetTheme)
        if (result) {
          themeMode.value = result.themeMode
          isDark.value = result.isDark
          await applyThemeToDOM()
        }
      } catch (e) {
        // 降级使用 localStorage
        const storedMode = localStorage.getItem('theme-mode') as ThemeMode
        if (storedMode) {
          themeMode.value = storedMode
        }
        await updateTheme()
      }
    }
  }

  /**
   * 监听主进程的主题变化广播
   */
  const setupThemeListener = () => {
    if (window.ipcRendererChannel && !cleanupThemeListener) {
      cleanupThemeListener = listen('theme-changed', (event, args) => {
        if (args) {
          themeMode.value = args.themeMode
          isDark.value = args.isDark
          applyThemeToDOM()
        }
      })
    }
  }

  // Listener for system changes
  const handleSystemChange = (e: MediaQueryListEvent) => {
    if (themeMode.value === 'system') {
      isDark.value = e.matches
      applyThemeToDOM()
      // 如果是 system 模式，需要通知其他窗口
      if (window.ipcRendererChannel) {
        invoke(IpcChannel.SetTheme, { themeMode: 'system' })
      }
    }
  }

  mediaQuery.addEventListener('change', handleSystemChange)

  // Watch for manual changes to persist in localStorage as fallback
  watch(themeMode, (val) => {
    localStorage.setItem('theme-mode', val)
  })

  // Initial setup
  initThemeFromMain()
  setupThemeListener()

  // Cleanup (though store is usually singleton)
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleSystemChange)
    if (cleanupThemeListener) {
      cleanupThemeListener()
      cleanupThemeListener = null
    }
  })

  return {
    themeMode,
    isDark,
    updateTheme,
    setTheme,
    initThemeFromMain,
  }
})
