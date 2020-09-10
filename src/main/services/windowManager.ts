import setIpc from './ipcMain'
import config from '@config/index'
import menuconfig from '../config/menu'
import DownloadUpdate from './downloadFile'
import Update from './checkupdate';
import { app, BrowserWindow, Menu, dialog } from 'electron'
import { winURL, loadingURL } from '../config/StaticPath'
import electronDevtoolsInstaller, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

class MainInit {

  public winURL: string = ''
  public shartURL: string = ''
  public loadWindow: BrowserWindow = null
  public mainWindow: BrowserWindow = null

  constructor() {
    this.winURL = winURL
    this.shartURL = loadingURL
    if (process.env.NODE_ENV === 'development') {
      menuconfig.push({
        label: '开发者设置',
        submenu: [{
          label: '切换到开发者模式',
          accelerator: 'CmdOrCtrl+I',
          role: 'toggledevtools'
        }]
      })
    }
  }
  // 主窗口函数
  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      height: 800,
      useContentSize: true,
      width: 1700,
      minWidth: 1366,
      show: false,
      frame: config.IsUseSysTitle,
      titleBarStyle: 'hidden',
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
    // 赋予模板
    const menu = Menu.buildFromTemplate(menuconfig as any)
    // 加载模板
    Menu.setApplicationMenu(menu)
    // 加载主窗口
    this.mainWindow.loadURL(this.winURL)
    // 下载文件
    new DownloadUpdate(this.mainWindow).start()
    // electron-update注册
    new Update(this.mainWindow)
    // 启用协议，这里暂时只用于自定义头部的时候使用
    setIpc.Mainfunc(this.mainWindow, config.IsUseSysTitle)
    // dom-ready之后显示界面
    this.mainWindow.webContents.once('dom-ready', () => {
      this.mainWindow.show()
      if (config.UseStartupChart) this.loadWindow.destroy()
    })
    // 开发模式下自动开启devtools
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools({ mode: 'undocked', activate: true })
    }
    // 当确定渲染进程卡死时
    this.mainWindow.webContents.on('crashed', () => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'warning',
        title: '警告',
        buttons: ['重载', '退出'],
        message: '图形化进程失去响应，是否等待其恢复？',
        noLink: true
      }).then(res => {
        if (res.response === 0) this.mainWindow.reload()
        else this.mainWindow.close()
      })
    })
    // 不知道什么原因，反正就是这个窗口里的页面触发了假死时执行
    this.mainWindow.on('unresponsive', () => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'warning',
        title: '警告',
        buttons: ['重载', '退出'],
        message: '图形化进程失去响应，是否等待其恢复？',
        noLink: true
      }).then(res => {
        if (res.response === 0) this.mainWindow.reload()
        else this.mainWindow.close()
      })
    })
    app.on('gpu-process-crashed', () => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'warning',
        title: '',
        buttons: ['切换', '退出'],
        message: '侦测到图形处理设备丢失，若继续则会导致软件出现意外故障，是否切换到通用模式，若切换后仍然黑屏请联系我们。',
        noLink: true
      }).then(res => {
        // 当显卡出现崩溃现象时使用该设置禁用显卡加速模式。
        if (res.response === 0) {
          app.disableHardwareAcceleration()
          this.mainWindow.reload()
        } else {
          this.mainWindow.close()
        }
      })
    })
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }
  // 加载窗口函数
  loadindWindow(loadingURL: string) {
    this.loadWindow = new BrowserWindow({
      width: 400,
      height: 600,
      frame: false,
      skipTaskbar: true,
      transparent: true,
      resizable: false,
      webPreferences: { experimentalFeatures: true }
    })

    this.loadWindow.loadURL(loadingURL)
    this.loadWindow.show()
    this.loadWindow.setAlwaysOnTop(true)
    // 延迟两秒可以根据情况后续调快，= =，就相当于个，sleep吧，就那种。 = =。。。
    setTimeout(() => {
      this.createMainWindow()
    }, 1500)
  }
  // 初始化窗口函数
  initWindow() {
    if (config.UseStartupChart) {
      return this.loadindWindow(this.shartURL)
    } else {
      return this.createMainWindow()
    }

  }
}
export default MainInit
