import config from '@config/index'
import { BrowserWindow, Details, dialog } from 'electron'
import { winURL, loadingURL, getPreloadFile } from '../config/static-path'
import { useProcessException } from '@main/hooks/exception-hook'

class MainInit {
  public winURL: string = ''
  public shartURL: string = ''
  public loadWindow: BrowserWindow | null = null
  public mainWindow: BrowserWindow | null = null
  private childProcessGone: (
    window: BrowserWindow,
    listener?: (
      event: { preventDefault: () => void; readonly defaultPrevented: boolean },
      details: Details,
    ) => void,
  ) => void
  private mainWindowGone: (window: BrowserWindow, listener?: () => void) => void

  constructor() {
    const { childProcessGone, mainWindowGone } = useProcessException()
    this.winURL = winURL
    this.shartURL = loadingURL
    this.childProcessGone = childProcessGone
    this.mainWindowGone = mainWindowGone
  }
  // 主窗口函数
  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      titleBarOverlay: {
        color: '#F2F3F5',
      },
      titleBarStyle: config.IsUseSysTitle ? 'default' : 'hidden',
      height: 800,
      useContentSize: true,
      width: 1700,
      minWidth: 1366,
      show: false,
      frame: config.IsUseSysTitle,
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

    // 加载主窗口
    this.mainWindow.loadURL(this.winURL)
    // dom-ready之后显示界面
    this.mainWindow.once('ready-to-show', () => {
      // this.mainWindow!.show()
      if (config.UseStartupChart) this.loadWindow!.destroy()
    })
    // 开发模式下自动开启devtools
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools({
        mode: 'undocked',
        activate: true,
      })
    }
    // 不知道什么原因，反正就是这个窗口里的页面触发了假死时执行
    this.mainWindowGone(this.mainWindow)
    /**
     * 新的gpu崩溃检测，详细参数详见：http://www.electronjs.org/docs/api/app
     * @returns {void}
     * @author zmr (umbrella22)
     * @date 2020-11-27
     */
    this.childProcessGone(this.mainWindow)
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }
  // 加载窗口函数
  loadingWindow(loadingURL: string) {
    this.loadWindow = new BrowserWindow({
      width: 400,
      height: 600,
      frame: false,
      skipTaskbar: true,
      transparent: true,
      resizable: false,
      webPreferences: {
        experimentalFeatures: true,
        preload: getPreloadFile('main-preload'),
      },
    })

    this.loadWindow.loadURL(loadingURL)
    this.loadWindow.show()
    this.loadWindow.setAlwaysOnTop(true)
    setTimeout(() => {
      this.createMainWindow()
    }, 1500)
  }
  // 初始化窗口函数
  initWindow() {
    if (config.UseStartupChart) {
      return this.loadingWindow(this.shartURL)
    } else {
      return this.createMainWindow()
    }
  }
}
export default MainInit
