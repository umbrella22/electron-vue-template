import { ipcMain, dialog } from 'electron'
import Server from '../server/index'
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
  }
}
