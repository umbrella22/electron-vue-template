import { BaseWindow, screen, WebContents, WebContentsView } from 'electron'
import { IpcChannel } from '@ipcManager/index'
import { IIpcBrowserHandle } from '@ipcManager/index'
import config from '@config/index'
import { browserDemoURL, getPreloadFile } from '@main/config/static-path'
import { useStoreHook } from '@main/hooks/store-hook'

const otherWindowConfig = {
  height: 595,
  useContentSize: true,
  width: 1140,
  autoHideMenuBar: true,
  minWidth: 842,
  frame: config.IsUseSysTitle,
  show: false,
}

type WinViewBindData = {
  win: BaseWindow
  tabbarView: WebContentsView
  viewList: WebContentsView[]
}

export class BrowserHandleClass implements IIpcBrowserHandle {
  private dragTabOffsetX: number = 0
  private lastDragView: WebContentsView | null = null
  private emptyWin: BaseWindow | null = null
  private viewFromWin: BaseWindow | null = null
  private useNewWindow: BaseWindow | null = null
  private startScreenY: number | null = null
  private isDragging: boolean = false
  private resizeDebounceTimer: NodeJS.Timeout | null = null
  private winViewBindList: WinViewBindData[] = []
  private winToData: WeakMap<BaseWindow, WinViewBindData> = new WeakMap()
  private tabbarWebContentsToWin: WeakMap<WebContents, BaseWindow> =
    new WeakMap()
  private viewToWin: WeakMap<WebContentsView, BaseWindow> = new WeakMap()
  private webContentsIdToView: Map<number, WebContentsView> = new Map()

  constructor() {
    this.dragTabOffsetX = 0
    this.startScreenY = null
  }

  OpenBrowserDemoWindow: (
    event: Electron.IpcMainInvokeEvent,
  ) => void | Promise<void> = async (event) => {
    this.openBrowserDemoWindow()
  }

  GetLastBrowserDemoTabData: (event: Electron.IpcMainInvokeEvent) =>
    | {
        positionX: number
        browserContentViewWebContentsId: number
        title: string
        url: string
      }
    | Promise<{
        positionX: number
        browserContentViewWebContentsId: number
        title: string
        url: string
      }> = async (event) => {
    if (this.lastDragView) {
      let positionX = -1
      if (this.dragTabOffsetX) {
        const currentWin = this.getWinFromView(this.lastDragView)
        if (currentWin) {
          const bound = currentWin.getBounds()
          const { x, y } = screen.getCursorScreenPoint()
          positionX = x - bound.x - this.dragTabOffsetX
        }
      }
      return {
        positionX,
        browserContentViewWebContentsId: this.lastDragView.webContents.id,
        title: this.lastDragView.webContents.getTitle(),
        url: this.lastDragView.webContents.getURL(),
      }
    }
    this.openBrowserDemoWindow()
    return {
      positionX: -1,
      browserContentViewWebContentsId: -1,
      title: '',
      url: '',
    }
  }

  AddDefaultBrowserView: (
    event: Electron.IpcMainInvokeEvent,
  ) =>
    | { browserContentViewWebContentsId: number }
    | Promise<{ browserContentViewWebContentsId: number }> = async (event) => {
    const currentWin = this.getWinFromTabbarWebContents(event.sender)
    let browserContentViewWebContentsId = -1
    if (currentWin) {
      const browserContentView = this.createDefaultBrowserView(currentWin)
      browserContentViewWebContentsId = browserContentView.webContents.id
    }
    return { browserContentViewWebContentsId }
  }

  SelectBrowserDemoTab: (
    event: Electron.IpcMainInvokeEvent,
    browserContentViewWebContentsId: number,
  ) => boolean | Promise<boolean> = async (
    event,
    browserContentViewWebContentsId,
  ) => {
    const currentWin = this.getWinFromTabbarWebContents(event.sender)
    let selected = false
    if (currentWin) {
      const viewList = this.getViewListFromWin(currentWin)
      for (let i = 0; i < viewList.length; i++) {
        const browserContentView = viewList[i]
        if (
          browserContentView.webContents.id === browserContentViewWebContentsId
        ) {
          browserContentView.setVisible(true)
          selected = true
        } else {
          browserContentView.setVisible(false)
        }
      }
    }
    return selected
  }

  DestroyBrowserDemoTab: (
    event: Electron.IpcMainInvokeEvent,
    browserContentViewWebContentsId: number,
  ) => void | Promise<void> = async (
    event,
    browserContentViewWebContentsId,
  ) => {
    const currentWin = this.getWinFromTabbarWebContents(event.sender)
    if (currentWin) {
      const view = this.getBrowserContentViewFromWebContentsId(
        browserContentViewWebContentsId,
      )
      if (!view) return

      this.removeBrowserView(currentWin, view)
      if (this.getViewListFromWin(currentWin).length === 0) {
        currentWin.close()
      }
      view.webContents.close()
    }
  }

  BrowserDemoTabJumpToUrl: (
    event: Electron.IpcMainInvokeEvent,
    args: {
      browserContentViewWebContentsId: number
      url: string
    },
  ) => void | Promise<void> = async (
    event,
    { browserContentViewWebContentsId, url },
  ) => {
    const currentView = this.getBrowserContentViewFromWebContentsId(
      browserContentViewWebContentsId,
    )
    if (currentView) {
      currentView.webContents.loadURL(url)
    }
  }

  BrowserTabMousedown: (
    event: Electron.IpcMainInvokeEvent,
    args: {
      offsetX: number
    },
  ) => void | Promise<void> = async (event, { offsetX }) => {
    this.dragTabOffsetX = offsetX
  }

  BrowserTabMousemove: (
    event: Electron.IpcMainInvokeEvent,
    args: {
      screenX: number
      screenY: number
      startX: number
      startY: number
      browserContentViewWebContentsId: number
    },
  ) => void | Promise<void> = async (
    event,
    { screenX, screenY, startX, startY, browserContentViewWebContentsId },
  ) => {
    this.isDragging = true
    if (!this.startScreenY) {
      this.startScreenY = screenY
    }
    if (!this.viewFromWin) {
      this.viewFromWin = this.getWinFromTabbarWebContents(event.sender)
    }
    let movingWin: BaseWindow | null = null
    const currentView = this.getBrowserContentViewFromWebContentsId(
      browserContentViewWebContentsId,
    )

    this.lastDragView = currentView || null
    if (this.viewFromWin && currentView) {
      if (this.getViewListFromWin(this.viewFromWin).length <= 1) {
        movingWin = this.viewFromWin
      } else {
        if (this.useNewWindow) {
          movingWin = this.useNewWindow
          this.viewFromWin = this.useNewWindow
        } else if (
          this.startScreenY &&
          Math.abs(this.startScreenY - screenY) > 40
        ) {
          if (this.emptyWin) {
            this.useNewWindow = this.emptyWin
            this.useNewWindow.setHasShadow(true)
            this.emptyWin = null
          } else {
            this.useNewWindow = this.openBrowserDemoWindow()
          }
          this.removeBrowserView(this.viewFromWin, currentView)
          this.addBrowserView(this.useNewWindow, currentView)
          this.viewFromWin = this.useNewWindow
          movingWin = this.useNewWindow
          movingWin.show()
          this.startScreenY = screenY

          const bound = movingWin.getBounds()
          const tabbarView = this.getTabbarViewFromWin(movingWin)
          if (tabbarView) {
            tabbarView.webContents.send(
              IpcChannel.BrowserViewTabPositionXUpdate,
              {
                dragTabOffsetX: this.dragTabOffsetX,
                positionX: screenX - bound.x,
                browserContentViewWebContentsId: currentView.webContents.id,
              },
            )
          }
        } else {
          for (let i = 0; i < this.winViewBindList.length; i++) {
            const existsWin = this.winViewBindList[i].win
            const bound = existsWin.getBounds()
            if (
              existsWin !== this.emptyWin &&
              bound.x < screenX &&
              bound.x + bound.width > screenX &&
              bound.y + 30 < screenY &&
              bound.y + 70 > screenY
            ) {
              const tabbarView = this.getTabbarViewFromWin(existsWin)
              if (tabbarView) {
                tabbarView.webContents.send(
                  IpcChannel.BrowserViewTabPositionXUpdate,
                  {
                    dragTabOffsetX: this.dragTabOffsetX,
                    positionX: screenX - bound.x,
                    browserContentViewWebContentsId: currentView.webContents.id,
                  },
                )
              }
              return
            }
          }
        }
      }
      if (movingWin) {
        movingWin.setPosition(screenX - startX, screenY - startY)
        for (let i = 0; i < this.winViewBindList.length; i++) {
          const existsWin = this.winViewBindList[i].win
          const bound = existsWin.getBounds()
          const tabbarCenterY = bound.y + 50
          if (
            existsWin !== this.emptyWin &&
            existsWin !== movingWin &&
            bound.x < screenX &&
            bound.x + bound.width > screenX &&
            Math.abs(tabbarCenterY - screenY) < 20
          ) {
            this.removeBrowserView(movingWin, currentView)
            if (this.getViewListFromWin(movingWin).length === 0) {
              this.emptyWin = movingWin
              this.emptyWin.setHasShadow(false)
              this.emptyWin.setAlwaysOnTop(false)
              this.emptyWin.setBounds(bound)
              if (this.emptyWin === this.useNewWindow) {
                this.useNewWindow = null
              }
            }
            this.addBrowserView(existsWin, currentView)
            this.viewFromWin = existsWin
            this.startScreenY = screenY
            return
          }
        }
      }
    }
  }

  BrowserTabMouseup: (
    event: Electron.IpcMainInvokeEvent,
  ) => void | Promise<void> = async (event) => {
    this.isDragging = false
    this.winViewBindList.forEach((item) => {
      const win = item.win
      if (this.getViewListFromWin(win).length === 0) {
        win?.close()
      } else {
        win?.setAlwaysOnTop(false)
        this.getTabbarViewFromWin(win)?.webContents.send(
          IpcChannel.BrowserTabMouseup,
        )
      }
    })
    this.useNewWindow = null
    this.startScreenY = null
    this.emptyWin = null
    this.viewFromWin = null
  }

  private openBrowserDemoWindow(): BaseWindow {
    const { getTitleBarOverlay, getIsDark } = useStoreHook()
    const overlay = getTitleBarOverlay()
    const isDark = getIsDark()
    const initialColor = isDark
      ? overlay.dark || '#050505'
      : overlay.light || '#F2F3F5'
    const win = new BaseWindow({
      titleBarOverlay: {
        color: initialColor,
      },
      titleBarStyle: config.IsUseSysTitle ? 'default' : 'hidden',
      ...otherWindowConfig,
    })

    const view = new WebContentsView({
      webPreferences: {
        sandbox: false,
        webSecurity: false,
        devTools: process.env.NODE_ENV === 'development',
        scrollBounce: process.platform === 'darwin',
        preload: getPreloadFile('main-preload'),
      },
    })
    {
      const bounds = win.getContentBounds()
      view.setBounds({
        x: 0,
        y: 0,
        width: bounds.width,
        height: bounds.height,
      })
    }
    win.contentView.addChildView(view)

    if (process.env.NODE_ENV === 'development') {
      view.webContents.openDevTools()
    }
    view.webContents.loadURL(browserDemoURL)
    view.webContents.on('dom-ready', () => {
      win.show()
    })

    const winViewData: WinViewBindData = {
      win,
      tabbarView: view,
      viewList: [],
    }
    this.winViewBindList.push(winViewData)
    this.winToData.set(win, winViewData)
    this.tabbarWebContentsToWin.set(view.webContents, win)

    win.on('resize', () => {
      if (this.isDragging) return
      if (this.resizeDebounceTimer) clearTimeout(this.resizeDebounceTimer)
      this.resizeDebounceTimer = setTimeout(() => {
        const bounds = win.getContentBounds()
        winViewData.tabbarView.setBounds({
          x: 0,
          y: 0,
          width: bounds.width,
          height: bounds.height,
        })
        for (const view of winViewData.viewList) {
          view.setBounds({
            x: 0,
            y: 110,
            width: bounds.width,
            height: bounds.height - 110,
          })
        }
      }, 50)
    })
    win.on('closed', () => {
      this.cleanupWindow(win)
    })
    return win
  }

  private createDefaultBrowserView(
    win: BaseWindow,
    defaultUrl = 'https://www.bing.com',
  ): WebContentsView {
    const view = new WebContentsView()
    this.addViewToWin(win, view)
    const bounds = win.getContentBounds()
    view.setBounds({
      x: 0,
      y: 110,
      width: bounds.width,
      height: bounds.height - 110,
    })
    view.webContents.loadURL(defaultUrl)
    view.webContents.on('page-title-updated', (event, title) => {
      this.freshTabData(null, view, 1)
    })
    view.webContents.on('destroyed', () => {
      this.removeBrowserView(null, view)
    })
    view.webContents.setWindowOpenHandler((details) => {
      const parentBw = this.getWinFromView(view)
      if (parentBw) {
        this.createDefaultBrowserView(parentBw, details.url)
      }
      return { action: 'deny' }
    })
    this.freshTabData(win, view, 1)

    return view
  }

  private addBrowserView(win: BaseWindow, view: WebContentsView): void {
    if (this.getWinFromView(view) !== win) {
      this.addViewToWin(win, view)
      const bounds = win.getContentBounds()
      view.setBounds({
        x: 0,
        y: 110,
        width: bounds.width,
        height: bounds.height - 110,
      })
      win.show()
      win.setAlwaysOnTop(true)
    }
    this.freshTabData(win, view, 1)
  }

  private removeBrowserView(
    win: BaseWindow | null,
    view: WebContentsView,
  ): void {
    const targetWin = win ?? this.getWinFromView(view)
    this.detachView(view, targetWin ?? undefined)
    this.freshTabData(targetWin, view, -1)
  }

  private freshTabData(
    win: BaseWindow | null,
    view: WebContentsView,
    status: -1 | 1,
  ): void {
    const _win = win ?? this.getWinFromView(view)
    if (_win) {
      const browserContentViewWebContentsId = this.safeGetWebContentsId(view)
      const { title, url } = this.safeGetWebContentsInfo(view)
      this.getTabbarViewFromWin(_win)?.webContents.send(
        IpcChannel.BrowserViewTabDataUpdate,
        {
          browserContentViewWebContentsId,
          title,
          url,
          status: status,
        },
      )
    }
  }

  private getWinFromView(view: WebContentsView): BaseWindow | null {
    return this.viewToWin.get(view) ?? null
  }

  private getWinFromTabbarWebContents(
    webContents: WebContents,
  ): BaseWindow | null {
    return this.tabbarWebContentsToWin.get(webContents) ?? null
  }

  private getViewListFromWin(win: BaseWindow): WebContentsView[] {
    return this.winToData.get(win)?.viewList ?? []
  }

  private getTabbarViewFromWin(win: BaseWindow): WebContentsView | null {
    return this.winToData.get(win)?.tabbarView ?? null
  }

  private addViewToWin(win: BaseWindow, view: WebContentsView): void {
    const item = this.winToData.get(win)
    if (!item) return
    this.attachView(win, view)
    for (const itemView of item.viewList) {
      if (itemView !== view) {
        itemView.setVisible(false)
      }
    }
  }

  private getBrowserContentViewFromWebContentsId(
    webContentsId: number,
  ): WebContentsView | null {
    return this.webContentsIdToView.get(webContentsId) ?? null
  }

  private attachView(win: BaseWindow, view: WebContentsView): void {
    const existingWin = this.viewToWin.get(view)
    if (existingWin && existingWin !== win) {
      this.detachView(view, existingWin)
    }

    const item = this.winToData.get(win)
    if (!item) return

    try {
      win.contentView.addChildView(view)
    } catch {}

    if (!item.viewList.includes(view)) {
      item.viewList.push(view)
    }
    this.viewToWin.set(view, win)
    this.webContentsIdToView.set(view.webContents.id, view)
  }

  private detachView(view: WebContentsView, winHint?: BaseWindow): void {
    const win = winHint ?? this.viewToWin.get(view)
    if (win) {
      try {
        win.contentView.removeChildView(view)
      } catch {}
      const item = this.winToData.get(win)
      if (item) {
        const index = item.viewList.indexOf(view)
        if (index !== -1) {
          item.viewList.splice(index, 1)
        }
      }
    } else {
      for (const item of this.winViewBindList) {
        const index = item.viewList.indexOf(view)
        if (index !== -1) {
          item.viewList.splice(index, 1)
          break
        }
      }
    }
    this.viewToWin.delete(view)
    this.deleteWebContentsIdMappingByView(view)
    if (this.lastDragView === view) {
      this.lastDragView = null
    }
  }

  private cleanupWindow(win: BaseWindow): void {
    const item = this.winToData.get(win)
    if (!item) return

    this.winToData.delete(win)
    this.tabbarWebContentsToWin.delete(item.tabbarView.webContents)

    const findIndex = this.winViewBindList.findIndex((v) => v.win === win)
    if (findIndex !== -1) {
      this.winViewBindList.splice(findIndex, 1)
    }

    const views = item.viewList.slice()
    item.viewList.length = 0
    for (const view of views) {
      this.viewToWin.delete(view)
      this.deleteWebContentsIdMappingByView(view)
      if (this.lastDragView === view) {
        this.lastDragView = null
      }
      try {
        view.webContents.close()
      } catch {}
    }

    try {
      item.tabbarView.webContents.closeDevTools()
    } catch {}
    try {
      item.tabbarView.webContents.close()
    } catch {}
  }

  private safeGetWebContentsInfo(view: WebContentsView): {
    title: string
    url: string
  } {
    try {
      return {
        title: view.webContents.getTitle(),
        url: view.webContents.getURL(),
      }
    } catch {
      return { title: '', url: '' }
    }
  }

  private safeGetWebContentsId(view: WebContentsView): number {
    try {
      return view.webContents.id
    } catch {
      for (const [id, mappedView] of this.webContentsIdToView.entries()) {
        if (mappedView === view) return id
      }
      return -1
    }
  }

  private deleteWebContentsIdMappingByView(view: WebContentsView): void {
    const id = this.safeGetWebContentsId(view)
    if (id !== -1) {
      this.webContentsIdToView.delete(id)
      return
    }
    for (const [mappedId, mappedView] of this.webContentsIdToView.entries()) {
      if (mappedView === view) {
        this.webContentsIdToView.delete(mappedId)
        return
      }
    }
  }
}
