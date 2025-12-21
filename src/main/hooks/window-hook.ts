import { BrowserWindow, nativeTheme } from 'electron'
import config from '@config/index'
import { useStoreHook } from '@main/hooks/store-hook'

type OverlayColors = {
  light: string
  dark: string
  symbolLight?: string
  symbolDark?: string
}

const DEFAULT_OVERLAY: OverlayColors = {
  light: '#F2F3F5',
  dark: '#050505',
  symbolLight: '#000000',
  symbolDark: '#FFFFFF',
}

export const useWindowHook = () => {
  const { getTitleBarOverlay } = useStoreHook()
  const getOverlayColors = (overrides?: Partial<OverlayColors>): OverlayColors => {
    return {
      ...DEFAULT_OVERLAY,
      ...overrides,
    }
  }

  const applyTitleBarOverlay = (
    window: BrowserWindow,
    isDark: boolean,
    overrides?: Partial<OverlayColors>,
  ) => {
    if (!window || config.IsUseSysTitle) return
    const storeOverrides = getTitleBarOverlay()
    const colors = getOverlayColors(storeOverrides || overrides)
    const color = isDark ? colors.dark : colors.light
    const symbolColor = isDark ? colors.symbolDark : colors.symbolLight
    try {
      window.setTitleBarOverlay({ color, symbolColor })
    } catch {
      // noop
    }
  }

  const applyTitleBarOverlayBySystemTheme = (
    window: BrowserWindow,
    overrides?: Partial<OverlayColors>,
  ) => {
    applyTitleBarOverlay(window, nativeTheme.shouldUseDarkColors, overrides)
  }

  return {
    applyTitleBarOverlay,
    applyTitleBarOverlayBySystemTheme,
  }
}
