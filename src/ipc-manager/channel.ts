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
  StartDownload!: IpcMainEventListener<string>
  OpenErrorbox!: IpcMainEventListener<{ title: string; message: string }>
  /**
   * 窗口准备就绪
   */
  WinReady!: IpcMainEventListener
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
  DownloadProgress!: IpcRendererEventListener<number>
  DownloadError!: IpcRendererEventListener<boolean>
  DownloadPaused!: IpcRendererEventListener<boolean>
  DownloadDone!: IpcRendererEventListener<{
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
    bvWebContentsId: number
    title: string
    url: string
    status: 1 | -1 // 1 添加/更新 -1 删除
  }>
  BrowserViewTabPositionXUpdate!: IpcRendererEventListener<{
    dragTabOffsetX: number
    positionX: number
    bvWebContentsId: number
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
      bvWebContentsId: number
      title: string
      url: string
    }
  >

  /**
   * 添加默认的 BrowserView
   */
  AddDefaultBrowserView!: IpcMainEventListener<
    void,
    { bvWebContentsId: number }
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
    bvWebContentsId: number
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
    bvWebContentsId: number
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
