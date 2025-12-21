import { dialog, BrowserWindow, BaseWindow, app } from 'electron'
import { getPreloadFile, winURL } from '../../config/static-path'
import DownloadFile from '../download/download-file'
import Update from '../update/check-update'
import config from '@config/index'
import { IIpcMainHandle } from '@ipcManager/index'
import { webContentSend } from './web-content-send'
import { useWindowHook } from '@main/hooks/window-hook'
import { useStoreHook } from '@main/hooks/store-hook'
import { useWindowLifecycle } from '../window/window-lifecycle'

export class IpcMainHandleClass implements IIpcMainHandle {
  private allUpdater: Update
  private downloadFileByWin = new WeakMap<BrowserWindow, DownloadFile>()
  constructor() {
    this.allUpdater = new Update()
  }
  WinReady: (event: Electron.IpcMainInvokeEvent) => void | Promise<void> =
    async (event) => {
      const windows = BrowserWindow.fromWebContents(event.sender)
      if (!windows) return

      // 如果使用启动图表（loader），则通过生命周期管理器处理
      // 否则直接显示窗口
      if (config.UseStartupChart) {
        const lifecycle = useWindowLifecycle()
        lifecycle.log('Renderer process ready signal received')
        // 生命周期管理器会在 loader 完成后显示窗口
        // 这里不需要额外操作，因为 ready-to-show 事件已经处理了
      } else {
        windows.show()
      }
    }
  SetTitleBarOverlay: (
    event: Electron.IpcMainInvokeEvent,
    args: { isDark: boolean },
  ) => void | Promise<void> = (event, args) => {
    const windows = BrowserWindow.fromWebContents(event.sender)
    if (!windows) return
    const { applyTitleBarOverlay } = useWindowHook()
    applyTitleBarOverlay(windows, !!args?.isDark)
  }
  SetTitleBarOverlayColors: (
    event: Electron.IpcMainInvokeEvent,
    args: {
      light?: string
      dark?: string
      symbolLight?: string
      symbolDark?: string
    },
  ) => void | Promise<void> = (event, args) => {
    const windows = BrowserWindow.fromWebContents(event.sender)
    if (!windows) return
    const { setTitleBarOverlay } = useStoreHook()
    setTitleBarOverlay(args || {})
  }
  GetTheme: (event: Electron.IpcMainInvokeEvent) => {
    themeMode: 'system' | 'light' | 'dark'
    isDark: boolean
  } = () => {
    const { getThemeMode, getIsDark } = useStoreHook()
    const themeMode = getThemeMode()
    const isDark = getIsDark(themeMode)
    return { themeMode, isDark }
  }
  SetTheme: (
    event: Electron.IpcMainInvokeEvent,
    args: { themeMode: 'system' | 'light' | 'dark' },
  ) => void | Promise<void> = (event, args) => {
    const { setThemeMode, getIsDark, getTitleBarOverlay } = useStoreHook()
    const { applyTitleBarOverlay } = useWindowHook()
    setThemeMode(args.themeMode)
    const isDark = getIsDark(args.themeMode)

    const processedWebContentsIds = new Set<number>()

    const allBrowserWindows = BrowserWindow.getAllWindows()
    allBrowserWindows.forEach((win) => {
      if (!win.isDestroyed()) {
        applyTitleBarOverlay(win, isDark)
        webContentSend['theme-changed'](win.webContents, {
          themeMode: args.themeMode,
          isDark,
        })
        processedWebContentsIds.add(win.webContents.id)
      }
    })

    const allBaseWindows = BaseWindow.getAllWindows()
    const overlay = getTitleBarOverlay()
    const color = isDark
      ? overlay.dark || '#050505'
      : overlay.light || '#F2F3F5'
    const symbolColor = isDark
      ? overlay.symbolDark || '#FFFFFF'
      : overlay.symbolLight || '#000000'

    allBaseWindows.forEach((win) => {
      if (!win.isDestroyed()) {
        try {
          win.setTitleBarOverlay({ color, symbolColor })
        } catch (e) {}

        const contentView = win.contentView
        if (contentView && 'children' in contentView) {
          const children = (contentView as any).children as any[]
          children?.forEach((child: any) => {
            if (
              child?.webContents &&
              !processedWebContentsIds.has(child.webContents.id)
            ) {
              webContentSend['theme-changed'](child.webContents, {
                themeMode: args.themeMode,
                isDark,
              })
              processedWebContentsIds.add(child.webContents.id)
            }
          })
        }
      }
    })
  }
  StartDownload: (
    event: Electron.IpcMainInvokeEvent,
    args: { id: string; url: string },
  ) => void | Promise<void> = (event, downloadUrl) => {
    const windwos = BrowserWindow.fromWebContents(event.sender)
    if (!windwos) return
    const downloader =
      this.downloadFileByWin.get(windwos) ?? new DownloadFile(windwos)
    this.downloadFileByWin.set(windwos, downloader)
    downloader.start(downloadUrl)
  }
  GetDownloadPath: () => string | Promise<string> = () => {
    const { getValue } = useStoreHook()
    return (
      getValue<string>('downloadPath', app.getPath('downloads')) ||
      app.getPath('downloads')
    )
  }
  SelectDownloadPath: (
    event: Electron.IpcMainInvokeEvent,
  ) => Promise<string | null> = async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    const { getValue, setValue } = useStoreHook()
    const defaultPath =
      getValue<string>('downloadPath', app.getPath('downloads')) ||
      app.getPath('downloads')

    const openOptions = {
      properties: ['openDirectory', 'createDirectory'] as Array<
        'openDirectory' | 'createDirectory'
      >,
      defaultPath,
    }
    const res = window
      ? await dialog.showOpenDialog(window, openOptions)
      : await dialog.showOpenDialog(openOptions)
    if (res.canceled || res.filePaths.length === 0) return null
    const selected = res.filePaths[0]
    setValue('downloadPath', selected)
    return selected
  }
  OpenWin: (
    event: Electron.IpcMainInvokeEvent,
    args: { url: string; IsPay?: boolean; PayUrl?: string; sendData?: unknown },
  ) => void | Promise<void> = (event, arg) => {
    const { getTitleBarOverlay, getIsDark } = useStoreHook()
    const overlay = getTitleBarOverlay()
    const isDark = getIsDark()
    const initialColor = isDark
      ? overlay.dark || '#050505'
      : overlay.light || '#F2F3F5'
    const childWin = new BrowserWindow({
      titleBarOverlay: {
        color: initialColor,
      },
      titleBarStyle: config.IsUseSysTitle ? 'default' : 'hidden',
      height: 595,
      useContentSize: true,
      width: 1140,
      autoHideMenuBar: true,
      minWidth: 842,
      frame: config.IsUseSysTitle,
      show: false,
      webPreferences: {
        sandbox: false,
        webSecurity: false,
        devTools: process.env.NODE_ENV === 'development',
        scrollBounce: process.platform === 'darwin',
        preload: getPreloadFile('main-preload'),
      },
    })
    if (process.env.NODE_ENV === 'development') {
      childWin.webContents.openDevTools({ mode: 'undocked', activate: true })
    }
    const url = arg.url || ''
    const isHttpUrl = /^https?:\/\//i.test(url)
    const loadTarget = isHttpUrl ? url : winURL + `#${url}`
    childWin.loadURL(loadTarget)
    childWin.once('ready-to-show', () => {
      const { getIsDark: getIsDarkState } = useStoreHook()
      const { applyTitleBarOverlay: applyOverlay } = useWindowHook()
      applyOverlay(childWin, getIsDarkState())
      childWin.show()

      if (arg.IsPay) {
        const testUrl = setInterval(() => {
          const Url = childWin.webContents.getURL()
          if (arg.PayUrl && Url.includes(arg.PayUrl)) {
            childWin.close()
          }
        }, 1200)
        childWin.on('close', () => {
          clearInterval(testUrl)
        })
      }
    })
    childWin.once('show', () => {
      webContentSend['send-data-test'](childWin.webContents, arg.sendData)
    })
  }

  IsUseSysTitle: (
    event: Electron.IpcMainInvokeEvent,
  ) => boolean | Promise<boolean> = async () => {
    return config.IsUseSysTitle
  }
  AppClose: (event: Electron.IpcMainInvokeEvent) => void | Promise<void> = (
    event,
  ) => {
    app.quit()
  }
  CheckUpdate: (event: Electron.IpcMainInvokeEvent) => void | Promise<void> = (
    event,
  ) => {
    const windows = BrowserWindow.fromWebContents(event.sender)
    if (!windows) return
    this.allUpdater.checkUpdate(windows)
  }
  ConfirmUpdate: (event: Electron.IpcMainInvokeEvent) => void | Promise<void> =
    () => {
      this.allUpdater.quitAndInstall()
    }
  OpenMessagebox: (
    event: Electron.IpcMainInvokeEvent,
    args: Electron.MessageBoxOptions,
  ) =>
    | Electron.MessageBoxReturnValue
    | Promise<Electron.MessageBoxReturnValue> = async (event, arg) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      throw new Error('No window found for event sender')
    }
    const res = await dialog.showMessageBox(window, {
      type: arg.type || 'info',
      title: arg.title || '',
      buttons: arg.buttons || [],
      message: arg.message || '',
      noLink: arg.noLink || true,
    })
    return res
  }
  OpenErrorbox: (
    event: Electron.IpcMainInvokeEvent,
    arg: { title: string; message: string },
  ) => void | Promise<void> = (event, arg) => {
    dialog.showErrorBox(arg.title, arg.message)
  }
}
