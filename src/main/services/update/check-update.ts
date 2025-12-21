import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'
import { webContentSend } from '../ipc/web-content-send'

class Update {
  public mainWindow?: BrowserWindow
  constructor() {
    autoUpdater.setFeedURL('http://127.0.0.1:25565/')
    autoUpdater.on('error', (err) => {
      console.log('更新出现错误', err.message)
      if (!this.mainWindow) return
      if (err.message.includes('sha512 checksum mismatch')) {
        this.Message(this.mainWindow, -1, 'sha512校验失败')
      } else {
        this.Message(this.mainWindow, -1, '错误信息请看主进程控制台')
      }
    })

    autoUpdater.on('checking-for-update', () => {
      console.log('开始检查更新')
      if (!this.mainWindow) return
      this.Message(this.mainWindow, 0)
    })

    autoUpdater.on('update-available', () => {
      console.log('有更新')
      if (!this.mainWindow) return
      this.Message(this.mainWindow, 1)
    })

    autoUpdater.on('update-not-available', () => {
      console.log('没有更新')
      if (!this.mainWindow) return
      this.Message(this.mainWindow, 2)
    })

    autoUpdater.on('download-progress', (progressObj) => {
      if (!this.mainWindow) return
      this.Message(this.mainWindow, 3, `${progressObj}`)
    })

    autoUpdater.on('update-downloaded', () => {
      console.log('下载完成')
      if (!this.mainWindow) return
      this.Message(this.mainWindow, 4)
    })
  }
  Message(mainWindow: BrowserWindow, type: number, data?: string) {
    const senddata = {
      state: type,
      msg: data || '',
    }
    webContentSend['update-msg'](mainWindow.webContents, senddata)
  }

  checkUpdate(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    autoUpdater.checkForUpdates().catch((err) => {
      console.log('网络连接问题', err)
    })
  }
  quitAndInstall() {
    autoUpdater.quitAndInstall()
  }
}

export default Update
