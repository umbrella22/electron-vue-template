import config from '@config/index'
import { BrowserWindow, Details } from 'electron'
import { winURL, loadingURL, getPreloadFile } from '../../config/static-path'
import { useProcessException } from '@main/hooks/exception-hook'
import { useWindowHook } from '@main/hooks/window-hook'
import { useStoreHook } from '@main/hooks/store-hook'
import { useWindowLifecycle, LifecyclePhase } from './window-lifecycle'

class MainInit {
  public winURL: string = ''
  public shartURL: string = ''
  public loadWindow: BrowserWindow | null = null
  public mainWindow: BrowserWindow | null = null
  private lifecycle = useWindowLifecycle()
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
  createMainWindow() {
    const { getTitleBarOverlay, getIsDark } = useStoreHook()
    const overlay = getTitleBarOverlay()
    const isDark = getIsDark()
    const initialColor = isDark
      ? overlay.dark || '#050505'
      : overlay.light || '#F2F3F5'

    // 生命周期：开始加载主窗口
    this.lifecycle.setPhase(
      LifecyclePhase.LOADING_ASSETS,
      'LOADING MAIN WINDOW...',
    )
    this.lifecycle.log('Creating main window...')

    this.mainWindow = new BrowserWindow({
      titleBarOverlay: {
        color: initialColor,
      },
      titleBarStyle: config.IsUseSysTitle ? 'default' : 'hidden',
      height: 800,
      useContentSize: true,
      width: 1700,
      minWidth: 1366,
      show: false,
      frame: config.IsUseSysTitle,
      webPreferences: {
        // 安全配置说明：
        // 1. sandbox: false - 禁用沙箱以允许预加载脚本使用 Node.js API
        //    注意：这会降低安全性，但为功能需求所必需
        //    替代方案：启用沙箱并通过 IPC 暴露有限 API
        sandbox: false,

        // 2. webSecurity: false - 禁用 web 安全以支持本地文件加载和开发便利
        //    注意：这会禁用同源策略等安全特性
        //    考虑在生产环境中启用，或仅开发环境禁用
        webSecurity: false,
        devTools: process.env.NODE_ENV === 'development',
        scrollBounce: process.platform === 'darwin',
        preload: getPreloadFile('main-preload'),
      },
    })

    // 设置生命周期管理器的主窗口引用
    this.lifecycle.setMainWindow(this.mainWindow)
    this.lifecycle.log('Main window created, loading content...')
    this.lifecycle.setPhase(
      LifecyclePhase.INITIALIZING_MODULES,
      'INITIALIZING MODULES...',
    )
    this.lifecycle.setProgress(50, 'LOADING_RENDERER')

    this.mainWindow.loadURL(this.winURL)
    this.mainWindow.once('ready-to-show', async () => {
      this.lifecycle.log('Main window ready to show')
      this.lifecycle.setPhase(
        LifecyclePhase.CONNECTING_SERVICES,
        'CONNECTING SERVICES...',
      )
      this.lifecycle.setProgress(80, 'FINALIZING')

      const { getIsDark: getIsDarkState } = useStoreHook()
      const { applyTitleBarOverlay } = useWindowHook()
      if (this.mainWindow)
        applyTitleBarOverlay(this.mainWindow, getIsDarkState())

      // 通知生命周期管理器主窗口准备就绪
      // 这会等待 loader 进度达到 100% 后才显示主窗口
      if (config.UseStartupChart) {
        this.lifecycle.setProgress(100, 'READY')
        await this.lifecycle.onMainWindowReady()
      } else {
        this.mainWindow?.show()
      }
    })
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools({
        mode: 'undocked',
        activate: true,
      })
    }
    this.mainWindowGone(this.mainWindow)
    this.childProcessGone(this.mainWindow)
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }
  loadingWindow(loadingURL: string) {
    // 重置生命周期状态
    this.lifecycle.reset()
    this.lifecycle.log('System boot sequence initiated...')
    this.lifecycle.setPhase(LifecyclePhase.INIT, 'SYSTEM INITIALIZING...')

    this.loadWindow = new BrowserWindow({
      width: 800,
      height: 400,
      frame: false,
      skipTaskbar: true,
      transparent: true,
      resizable: false,
      webPreferences: {
        experimentalFeatures: true,
        preload: getPreloadFile('loader-preload'),
      },
    })

    // 设置生命周期管理器的 loader 窗口引用
    this.lifecycle.setLoadWindow(this.loadWindow)

    this.loadWindow.loadURL(loadingURL)
    this.loadWindow.show()
    this.loadWindow.setAlwaysOnTop(true)

    // loader 窗口准备好后开始初始化流程
    this.loadWindow.webContents.once('did-finish-load', () => {
      // 在 loader 窗口内容加载完成后才开始计时
      this.lifecycle.startLoaderTimer()
      this.lifecycle.log('Loader window ready')
      this.lifecycle.setPhase(
        LifecyclePhase.LOADING_CONFIG,
        'LOADING CONFIGURATION...',
      )
      this.lifecycle.setProgress(10, 'LOADING_CONFIG')

      // 开始创建主窗口
      setTimeout(() => {
        this.lifecycle.log('Starting main window creation...')
        this.lifecycle.setProgress(20, 'CREATING_WINDOW')
        this.createMainWindow()
      }, 500)
    })
  }
  initWindow() {
    if (config.UseStartupChart) {
      return this.loadingWindow(this.shartURL)
    } else {
      return this.createMainWindow()
    }
  }
}
export default MainInit
