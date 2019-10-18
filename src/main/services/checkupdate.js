import { autoUpdater } from 'electron-updater'
import { ipcMain } from 'electron'
/**
 * -1 检查更新失败 0 正在检查更新 1 检测到新版本，准备下载 2 未检测到新版本 3 下载中 4 下载暂停 5 下载暂停恢复 6 下载完成 7 下载失败 8 取消下载
 * */
function Message (mainWindow, type, data) {
  const senddata = {
    state: type,
    msg: data
  }
  mainWindow.webContents.send('UpdateMsg', senddata)
}

export default {
  Update (mainWindow) {
    // 设置地址要和package中的一样
    autoUpdater.setFeedURL('http://127.0.0.1:25565/')

    // 当更新发生错误的时候触发。
    autoUpdater.on('error', (err) => {
      console.log('更新出现错误')
      console.log(err)
      Message(mainWindow, -1, err)
    })

    // 当开始检查更新的时候触发
    autoUpdater.on('checking-for-update', (event, arg) => {
      console.log('开始检查更新')
      Message(mainWindow, 0)
    })

    // 发现可更新数据时
    autoUpdater.on('update-available', (event, arg) => {
      console.log('有更新')
      Message(mainWindow, 1)
    })

    // 没有可更新数据时
    autoUpdater.on('update-not-available', (event, arg) => {
      console.log('没有更新')
      Message(mainWindow, 2)
    })

    // 下载监听
    autoUpdater.on('download-progress', (progressObj) => {
      Message(mainWindow, 3, progressObj)
    })

    // 下载完成
    autoUpdater.on('update-downloaded', () => {
      console.log('下载完成')
      Message(mainWindow, 4)
    })
    // 执行自动更新检查
    ipcMain.on('check-update', () => {
      autoUpdater.checkForUpdates()
    })
    // 渲染进程执行更新操作
    ipcMain.on('confirm-update', () => {
      autoUpdater.quitAndInstall()
    })
  }
}
