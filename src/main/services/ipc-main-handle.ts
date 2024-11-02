import { dialog, BrowserWindow, app } from 'electron'
import { getPreloadFile, winURL } from '../config/static-path'
import { updater } from '../services/hot-updater'
import DownloadFile from '../services/download-file'
import Update from '../services/check-update'
import config from '@config/index'
import { IIpcMainHandle } from '@ipcManager/index'
import { webContentSend } from './web-content-send'

export class IpcMainHandleClass implements IIpcMainHandle {
  private allUpdater: Update
  constructor() {
    this.allUpdater = new Update()
  }
  StartDownload: (
    event: Electron.IpcMainInvokeEvent,
    args: string,
  ) => void | Promise<void> = (event, downloadUrl) => {
    const windwos = BrowserWindow.fromWebContents(event.sender)
    if (!windwos) return
    new DownloadFile(windwos, downloadUrl).start()
  }
  StartServer: (
    event: Electron.IpcMainInvokeEvent,
  ) => string | Promise<string> = async () => {
    dialog.showErrorBox('error', 'API is obsolete')
    return 'API is obsolete'
  }
  StopServer: (event: Electron.IpcMainInvokeEvent) => string | Promise<string> =
    async () => {
      dialog.showErrorBox('error', 'API is obsolete')
      return 'API is obsolete'
    }
  HotUpdate: (event: Electron.IpcMainInvokeEvent) => void | Promise<void> = (
    event,
  ) => {
    const windows = BrowserWindow.fromWebContents(event.sender)
    if (!windows) return
    updater(windows)
  }
  OpenWin: (
    event: Electron.IpcMainInvokeEvent,
    args: { url: string; IsPay?: boolean; PayUrl?: string; sendData?: unknown },
  ) => void | Promise<void> = (event, arg) => {
    const childWin = new BrowserWindow({
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
        // 如果是开发模式可以使用devTools
        devTools: process.env.NODE_ENV === 'development',
        // 在macos中启用橡皮动画
        scrollBounce: process.platform === 'darwin',
        preload: getPreloadFile('main-preload'),
      },
    })
    // 开发模式下自动开启devtools
    if (process.env.NODE_ENV === 'development') {
      childWin.webContents.openDevTools({ mode: 'undocked', activate: true })
    }
    childWin.loadURL(winURL + `#${arg.url}`)
    childWin.once('ready-to-show', () => {
      childWin.show()
      if (arg.IsPay) {
        // 检查支付时候自动关闭小窗口
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
    // 渲染进程显示时触发
    childWin.once('show', () => {
      webContentSend.SendDataTest(childWin.webContents, arg.sendData)
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
    const res = await dialog.showMessageBox(
      BrowserWindow.fromWebContents(event.sender),
      {
        type: arg.type || 'info',
        title: arg.title || '',
        buttons: arg.buttons || [],
        message: arg.message || '',
        noLink: arg.noLink || true,
      },
    )
    return res
  }
  OpenErrorbox: (
    event: Electron.IpcMainInvokeEvent,
    arg: { title: string; message: string },
  ) => void | Promise<void> = (event, arg) => {
    dialog.showErrorBox(arg.title, arg.message)
  }
}
