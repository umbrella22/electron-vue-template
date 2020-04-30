import { ipcMain, dialog, BrowserWindow } from 'electron'
import Server from '../server/index'
import { winURL } from '../config/StaticPath'

export default {
  Mainfunc (mainWindow, IsUseSysTitle) {
    ipcMain.on('IsUseSysTitle', (event) => {
      const data = IsUseSysTitle
      event.reply('CisUseSysTitle', data)
    })
    ipcMain.on('windows-mini', () => {
      mainWindow.minimize()
    })
    ipcMain.on('window-max', (event) => {
      if (mainWindow.isMaximized()) {
        event.reply('window-confirm', false)
        mainWindow.restore()
      } else {
        event.reply('window-confirm', true)
        mainWindow.maximize()
      }
    })
    ipcMain.on('window-close', () => {
      mainWindow.close()
    })
    ipcMain.on('open-messagebox', (event, arg) => {
      dialog.showMessageBox(mainWindow, {
        type: arg.type || 'info',
        title: arg.title || '',
        buttons: arg.buttons || [],
        message: arg.message || '',
        noLink: arg.noLink || true
      }).then(res => {
        event.reply('confirm-message', res)
      })
    })
    ipcMain.on('open-errorbox', (event, arg) => {
      dialog.showErrorBox(
        arg.title,
        arg.message
      )
    })
    ipcMain.on('statr-server', (event, arg) => {
      Server.StatrServer().then(res => {
        event.reply('confirm-start', res)
      }).catch(err => {
        dialog.showErrorBox(
          '错误',
          err
        )
      })
    })
    ipcMain.on('stop-server', (event, arg) => {
      Server.StopServer().then(res => {
        event.reply('confirm-stop', res)
      }).catch(err => {
        dialog.showErrorBox(
          '错误',
          err
        )
      })
    })
    ipcMain.on('open-win', (event, arg) => {
      const ChildWin = new BrowserWindow({
        height: 595,
        useContentSize: true,
        width: 842,
        autoHideMenuBar: true,
        minWidth: 842,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          webSecurity: false,
          // 如果是开发模式可以使用devTools
          devTools: process.env.NODE_ENV === 'development',
          // devTools: true,
          // 在macos中启用橡皮动画
          scrollBounce: process.platform === 'darwin'
        }
      })
      ChildWin.loadURL(winURL + `#${arg.url}`)
      ChildWin.webContents.once('dom-ready', () => {
        ChildWin.show()
        ChildWin.webContents.send('send-data', arg.sendData)
        if (arg.IsPay) {
          // 检查支付时候自动关闭小窗口
          const testUrl = setInterval(() => {
            const Url = ChildWin.webContents.getURL()
            if (Url.includes(arg.PayUrl)) {
              ChildWin.close()
            }
          }, 1200)
          ChildWin.on('close', () => {
            clearInterval(testUrl)
          })
        }
      })
    })
  }
}
