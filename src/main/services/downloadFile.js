/* eslint-disable no-case-declarations */
import { app, ipcMain, dialog } from 'electron'
import path from 'path'
import os from 'os'
// 版本以package.json为基准。
const version = require('../../../package.json').version
// 您的下载地址
const baseUrl = 'http://127.0.0.1:25565/'
var Sysarch = null
var defaultDownloadUrL = null
// 识别操作系统位数D
os.arch().includes('64') ? Sysarch = 'win64' : Sysarch = 'win32'
// 识别操作系统
// linux自己修改后缀名哦，我没有linux就没有测试了
if (os.platform().includes('win32')) {
  defaultDownloadUrL = baseUrl + `electron_${version}_${Sysarch}.exe?${new Date().getTime()}`
} else if (os.platform().includes('linux')) {
  defaultDownloadUrL = baseUrl + `electron_${version}_${Sysarch}?${new Date().getTime()}`
} else {
  defaultDownloadUrL = baseUrl + `electron_${version}_mac.dmg?${new Date().getTime()}`
}
export default {
  download (mainWindow) {
    ipcMain.handle('start-download', (event, msg) => {
      mainWindow.webContents.downloadURL(msg.downloadUrL || defaultDownloadUrL)
      mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
        //   将文件保存在系统的下载目录
        const filePath = path.join(app.getPath('downloads'), item.getFilename())
        // 自动保存
        item.setSavePath(filePath)
        // 下载进度
        item.on('updated', (event, state) => {
          switch (state) {
            case 'progressing':
              mainWindow.webContents.send('download-progress', (item.getReceivedBytes() / item.getTotalBytes() * 100).toFixed(0))
              break
            case 'interrupted ':
              mainWindow.webContents.send('download-paused', true)
              break
            default:

              break
          }
        })
        // 下载完成或失败
        item.once('done', (event, state) => {
          switch (state) {
            case 'completed':
              const data = {
                filePath
              }
              mainWindow.webContents.send('download-done', data)
              break
            case 'interrupted':
              mainWindow.webContents.send('download-error', true)
              dialog.showErrorBox('下载出错', '由于网络或其他未知原因导致客户端下载出错，请前往官网进行重新安装')
              break
            default:
              break
          }
        })
      })
    })
  }
}
