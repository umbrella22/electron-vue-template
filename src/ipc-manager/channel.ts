import type { ProgressInfo } from 'electron-updater'

export interface IpcMainEventListener<Send = void, Receive = void> {
  ipcMainHandle: Send extends void
    ? (event: Electron.IpcMainInvokeEvent) => Receive | Promise<Receive>
    : (
        event: Electron.IpcMainInvokeEvent,
        args: Send,
      ) => Receive | Promise<Receive>
  ipcRendererInvoke: Send extends void
    ? () => Promise<Receive>
    : (args: Send) => Promise<Receive>
}

export interface IpcRendererEventListener<Send = void> {
  ipcRendererOn: Send extends void
    ? (event: Electron.IpcRendererEvent) => void
    : (event: Electron.IpcRendererEvent, args: Send) => void
  webContentSend: Send extends void
    ? (webContents: Electron.WebContents) => void
    : (webContents: Electron.WebContents, args: Send) => void
}

export class IpcChannelMainClass {
  IsUseSysTitle!: IpcMainEventListener<void, boolean>
  /**
   * 退出应用
   */
  AppClose!: IpcMainEventListener
  CheckUpdate!: IpcMainEventListener
  ConfirmUpdate!: IpcMainEventListener
  OpenMessagebox!: IpcMainEventListener<
    Electron.MessageBoxOptions,
    Electron.MessageBoxReturnValue
  >
  GetDownloadPath!: IpcMainEventListener<void, string>
  SelectDownloadPath!: IpcMainEventListener<void, string | null>
  StartDownload!: IpcMainEventListener<{
    id: string
    url: string
  }>
  OpenErrorbox!: IpcMainEventListener<{ title: string; message: string }>
  /**
   * 窗口准备就绪
   */
  WinReady!: IpcMainEventListener
  /**
   * 设置窗口标题栏覆盖颜色
   */
  SetTitleBarOverlay!: IpcMainEventListener<{ isDark: boolean }>
  /**
   * 设置并持久化标题栏颜色集
   */
  SetTitleBarOverlayColors!: IpcMainEventListener<{
    light?: string
    dark?: string
    symbolLight?: string
    symbolDark?: string
  }>
  /**
   * 获取当前主题模式
   */
  GetTheme!: IpcMainEventListener<
    void,
    { themeMode: 'system' | 'light' | 'dark'; isDark: boolean }
  >
  /**
   * 设置主题模式并同步到所有窗口
   */
  SetTheme!: IpcMainEventListener<{ themeMode: 'system' | 'light' | 'dark' }>
  /**
   *
   * 打开窗口
   */
  OpenWin!: IpcMainEventListener<{
    /**
     * 新的窗口地址
     *
     * @type {string}
     */
    url: string

    /**
     * 是否是支付页
     *
     * @type {boolean}
     */
    IsPay?: boolean

    /**
     * 支付参数
     *
     * @type {string}
     */
    PayUrl?: string

    /**
     * 发送的新页面数据
     *
     * @type {unknown}
     */
    sendData?: unknown
  }>
}

export class IpcChannelRendererClass {
  // ipcRenderer
  /**
   * 主题变化通知（广播到所有窗口）
   */
  ThemeChanged!: IpcRendererEventListener<{
    themeMode: 'system' | 'light' | 'dark'
    isDark: boolean
  }>
  /**
   * 生命周期更新通知（发送到 loader 窗口）
   */
  LifecycleUpdate!: IpcRendererEventListener<{
    percent: number
    message: string
    subText: string
    phase: string
  }>
  /**
   * 生命周期日志通知（发送到 loader 窗口）
   */
  LifecycleLog!: IpcRendererEventListener<{
    message: string
    type: 'info' | 'highlight' | 'error'
  }>
  /**
   * 生命周期错误通知（发送到 loader 窗口）
   */
  LifecycleError!: IpcRendererEventListener<{
    message: string
    code?: string
  }>
  DownloadProgress!: IpcRendererEventListener<{
    id: string
    progress: number
    receivedBytes: number
    totalBytes: number
  }>
  DownloadError!: IpcRendererEventListener<{
    id: string
    message?: string
  }>
  DownloadPaused!: IpcRendererEventListener<boolean>
  DownloadDone!: IpcRendererEventListener<{
    id: string
    /**
     * 下载的文件路径
     *
     * @type {string}
     */
    filePath: string
  }>
  UpdateMsg!: IpcRendererEventListener<{
    state: number
    msg: string | ProgressInfo
  }>
  UpdateProcessStatus!: IpcRendererEventListener<{
    status:
      | 'init'
      | 'downloading'
      | 'moving'
      | 'finished'
      | 'failed'
      | 'download'
    message: string
  }>

  SendDataTest!: IpcRendererEventListener<unknown>
  BrowserViewTabDataUpdate!: IpcRendererEventListener<{
    browserContentViewWebContentsId: number
    title: string
    url: string
    status: 1 | -1 // 1 添加/更新 -1 删除
  }>
  BrowserViewTabPositionXUpdate!: IpcRendererEventListener<{
    dragTabOffsetX: number
    positionX: number
    browserContentViewWebContentsId: number
  }>
  BrowserTabMouseup!: IpcRendererEventListener
  HotUpdateStatus!: IpcRendererEventListener<{
    status: string
    message: string
  }>
}

export class IpcChannelBrowserClass {
  /**
   * 打开浏览器演示窗口
   */
  OpenBrowserDemoWindow!: IpcMainEventListener

  /**
   * 获取最后一个拖拽的浏览器标签数据
   */
  GetLastBrowserDemoTabData!: IpcMainEventListener<
    void,
    {
      positionX: number
      browserContentViewWebContentsId: number
      title: string
      url: string
    }
  >

  /**
   * 添加默认的 BrowserView
   */
  AddDefaultBrowserView!: IpcMainEventListener<
    void,
    { browserContentViewWebContentsId: number }
  >

  /**
   * 选择浏览器标签
   */
  SelectBrowserDemoTab!: IpcMainEventListener<number, boolean>

  /**
   * 销毁浏览器标签
   */
  DestroyBrowserDemoTab!: IpcMainEventListener<number>

  /**
   * 浏览器标签跳转到指定 URL
   */
  BrowserDemoTabJumpToUrl!: IpcMainEventListener<{
    browserContentViewWebContentsId: number
    url: string
  }>

  /**
   * 浏览器标签鼠标按下事件
   */
  BrowserTabMousedown!: IpcMainEventListener<{
    offsetX: number
  }>

  /**
   * 浏览器标签鼠标移动事件
   */
  BrowserTabMousemove!: IpcMainEventListener<{
    screenX: number
    screenY: number
    startX: number
    startY: number
    browserContentViewWebContentsId: number
  }>

  /**
   * 浏览器标签鼠标抬起事件
   */
  BrowserTabMouseup!: IpcMainEventListener
}

export class IpcChannelPrintClass {
  /**
   * 获取打印机列表
   */
  GetPrinters!: IpcMainEventListener<void, Electron.PrinterInfo[]>

  /**
   * 执行打印操作
   */
  PrintHandlePrint!: IpcMainEventListener<
    Electron.WebContentsPrintOptions,
    { success: boolean; failureReason: string }
  >

  /**
   * 打开打印演示窗口
   */
  OpenPrintDemoWindow!: IpcMainEventListener
}

export class IpcChannelHotUpdaterClass {
  /**
   * 执行热更新
   */
  HotUpdate!: IpcMainEventListener
}
