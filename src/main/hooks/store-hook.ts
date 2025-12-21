import Store from 'electron-store'
import { nativeTheme } from 'electron'

type OverlayColors = {
  light?: string
  dark?: string
  symbolLight?: string
  symbolDark?: string
}

export type ThemeMode = 'system' | 'light' | 'dark'

const store = new Store()

export const useStoreHook = () => {
  const getTitleBarOverlay = (): Partial<OverlayColors> => {
    const v = store.get('titleBarOverlay') as Partial<OverlayColors> | undefined
    return v || {}
  }

  const setTitleBarOverlay = (colors: Partial<OverlayColors>) => {
    store.set('titleBarOverlay', colors)
  }

  /**
   * 获取当前主题模式
   */
  const getThemeMode = (): ThemeMode => {
    const v = store.get('themeMode') as ThemeMode | undefined
    return v || 'system'
  }

  /**
   * 设置主题模式
   */
  const setThemeMode = (mode: ThemeMode) => {
    store.set('themeMode', mode)
  }

  /**
   * 根据主题模式计算是否为深色
   */
  const getIsDark = (themeMode?: ThemeMode): boolean => {
    const mode = themeMode ?? getThemeMode()
    if (mode === 'system') {
      return nativeTheme.shouldUseDarkColors
    }
    return mode === 'dark'
  }

  const getValue = <T = any>(key: string, defaultValue?: T): T | undefined => {
    const v = store.get(key) as T | undefined
    if (v === undefined) return defaultValue
    return v
  }

  const setValue = (key: string, value: any) => {
    store.set(key, value)
  }

  return {
    getTitleBarOverlay,
    setTitleBarOverlay,
    getThemeMode,
    setThemeMode,
    getIsDark,
    getValue,
    setValue,
  }
}
