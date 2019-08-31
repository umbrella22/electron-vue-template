export default {
  Mainfunc (ipc, mainWindow) {
    ipc.on('windows-mini', () => {
      mainWindow.minimize()
    })
    ipc.on('window-max', (event) => {
      if (mainWindow.isMaximized()) {
        event.reply('window-confirm', false)
        mainWindow.restore()
      } else {
        event.reply('window-confirm', true)
        mainWindow.maximize()
      }
    })
    ipc.on('window-close', () => {
      mainWindow.close()
    })
  }
}
