import { BrowserWindow, WebContentsPrintOptions, nativeTheme } from 'electron'
import { IIpcPrintHandle } from '@ipcManager/index'
import config from '@config/index'
import { printURL, getPreloadFile } from '@main/config/static-path'
import { useStoreHook } from '@main/hooks/store-hook'

const otherWindowConfig = {
  height: 595,
  useContentSize: true,
  width: 1140,
  autoHideMenuBar: true,
  minWidth: 842,
  frame: config.IsUseSysTitle,
  show: false,
}

export class PrintHandleClass implements IIpcPrintHandle {
  private win: BrowserWindow | null = null

  constructor() {
    this.win = null
  }

  GetPrinters: (
    event: Electron.IpcMainInvokeEvent,
  ) => Electron.PrinterInfo[] | Promise<Electron.PrinterInfo[]> = async (
    event,
  ) => {
    return await event.sender.getPrintersAsync()
  }

  PrintHandlePrint: (
    event: Electron.IpcMainInvokeEvent,
    options: Electron.WebContentsPrintOptions,
  ) =>
    | { success: boolean; failureReason: string }
    | Promise<{ success: boolean; failureReason: string }> = async (
    event,
    options,
  ) => {
    return new Promise((resolve) => {
      event.sender.print(options, (success: boolean, failureReason: string) => {
        resolve({ success, failureReason })
      })
    })
  }

  OpenPrintDemoWindow: (
    event: Electron.IpcMainInvokeEvent,
  ) => void | Promise<void> = async (_event) => {
    this.openPrintDemoWindow()
  }

  private openPrintDemoWindow(): void {
    if (this.win) {
      this.win.show()
      return
    }
    const { getTitleBarOverlay } = useStoreHook()
    const overlay = getTitleBarOverlay()
    const initialColor = nativeTheme.shouldUseDarkColors
      ? overlay.dark || '#050505'
      : overlay.light || '#F2F3F5'
    this.win = new BrowserWindow({
      titleBarOverlay: {
        color: initialColor,
      },
      titleBarStyle: config.IsUseSysTitle ? 'default' : 'hidden',
      ...Object.assign(otherWindowConfig, {}),
      webPreferences: {
        sandbox: false,
        webSecurity: false,
        devTools: process.env.NODE_ENV === 'development',
        scrollBounce: process.platform === 'darwin',
        preload: getPreloadFile('main-preload'),
      },
    })
    if (process.env.NODE_ENV === 'development') {
      this.win.webContents.openDevTools({
        mode: 'undocked',
        activate: true,
      })
    }
    this.win.loadURL(printURL)
    this.win.on('ready-to-show', () => {
      this.win?.show()
    })
    this.win.on('closed', () => {
      this.win = null
    })
  }
}

