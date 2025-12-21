import type { ComputedRef } from 'vue'

export enum ToolId {
  Console = 'console',
  CheckUpdate = 'check-update',
  CheckUpdate2 = 'check-update-2',
  CheckUpdateInc = 'check-update-inc',
  CrashSim = 'crash-sim',
  OpenWindow = 'open-window',
  Browser = 'browser',
  Print = 'print',
}

export interface ToolDefinition {
  name: string
  avatar: string
  action?: () => void
  mainCode?: string
  rendererCode?: string
}

export interface ToolsContext {
  i18nt: ComputedRef<any>
  invoke: (channel: any, args?: any) => Promise<any>
  IpcChannel: any
  crash: { start: () => void }
}

export function createToolsData(
  ctx: ToolsContext,
): Record<ToolId, ToolDefinition> {
  const { i18nt, invoke, IpcChannel, crash } = ctx
  return {
    [ToolId.Console]: {
      name: i18nt.value.buttons.console,
      avatar: 'i-tdesign-code',
      action: () => console.log('Console button clicked'),
      mainCode: `// No main process interaction for this tool`,
      rendererCode: `// Renderer Process
console.log('Console button clicked')`,
    },
    [ToolId.CheckUpdate]: {
      name: i18nt.value.buttons.checkUpdate,
      avatar: 'i-tdesign-refresh',
      action: () => invoke(IpcChannel.CheckUpdate),
      mainCode: `// Main Process: src/main/services/ipc/ipc-main-handle.ts
CheckUpdate: (event) => {
  const windows = BrowserWindow.fromWebContents(event.sender)
  if (!windows) return
  this.allUpdater.checkUpdate(windows)
}

// Service: src/main/services/update/check-update.ts
checkUpdate(mainWindow: BrowserWindow) {
  this.mainWindow = mainWindow
  autoUpdater.checkForUpdates().catch((err) => {
    console.log('网络连接问题', err)
  })
}`,
      rendererCode: `// Renderer Process
async function checkUpdate() {
  await invoke(IpcChannel.CheckUpdate)
}`,
    },
    [ToolId.CheckUpdate2]: {
      name: i18nt.value.buttons.checkUpdate2,
      avatar: 'i-tdesign-refresh',
      action: () => invoke(IpcChannel.ConfirmUpdate),
      mainCode: `// Main Process: src/main/services/ipc/ipc-main-handle.ts
ConfirmUpdate: () => {
  this.allUpdater.quitAndInstall()
}

// Service: src/main/services/update/check-update.ts
quitAndInstall() {
  autoUpdater.quitAndInstall()
}`,
      rendererCode: `// Renderer Process
async function confirmUpdate() {
  await invoke(IpcChannel.ConfirmUpdate)
}`,
    },
    [ToolId.CheckUpdateInc]: {
      name: i18nt.value.buttons.checkUpdateInc,
      avatar: 'i-tdesign-download',
      action: () => invoke(IpcChannel.HotUpdate),
      mainCode: `// Main Process: src/main/services/update/hot-updater-class.ts
HotUpdate: (event) => {
  const windows = BrowserWindow.fromWebContents(event.sender)
  if (!windows) return
  updater(windows)
}

// Service: src/main/services/update/hot-updater.ts
export const updater = async (windows?: BrowserWindow): Promise<void> => {
  try {
    const res = await request({
      url: \`\${hotPublishConfig.url}/\${hotPublishConfig.configName}.json?time=\${new Date().getTime()}\`,
    })
    if (gt(res.data.version, version)) {
      await emptyDir(updatePath)
      const filePath = join(updatePath, res.data.name)
      updateInfo.status = 'downloading'
      if (windows) webContentSend.HotUpdateStatus(windows.webContents, updateInfo)
      await download(\`\${hotPublishConfig.url}/\${res.data.name}\`, filePath)
      // ... verification and extraction logic ...
      const zip = new AdmZip(filePath)
      zip.extractAllTo(appPathTemp, true, true)
      updateInfo.status = 'moving'
      if (windows) webContentSend.HotUpdateStatus(windows.webContents, updateInfo)
      await remove(join(\`\${appPath}\`, 'dist'))
      await remove(join(\`\${appPath}\`, 'package.json'))
      await copy(appPathTemp, appPath)
      updateInfo.status = 'finished'
      if (windows) webContentSend.HotUpdateStatus(windows.webContents, updateInfo)
    }
  } catch (error) {
    updateInfo.status = 'failed'
    if (windows) webContentSend.HotUpdateStatus(windows.webContents, updateInfo)
  }
}`,
      rendererCode: `// Renderer Process
async function hotUpdate() {
  await invoke(IpcChannel.HotUpdate)
}`,
    },
    [ToolId.CrashSim]: {
      name: i18nt.value.buttons.simulatedCrash,
      avatar: 'i-tdesign-error-circle',
      action: () => crash.start(),
      mainCode: `// Main Process: src/main/hooks/exception-hook.ts
app.on('render-process-gone', (event, webContents, details) => {
  const message = { title: '', buttons: [], message: '' }
  switch (details.reason) {
    case 'crashed':
      message.title = '警告'
      message.buttons = ['确定', '退出']
      message.message = '图形化进程崩溃，是否进行软重启操作？'
      break
    // ... handle other reasons (killed, oom)
  }
  dialog.showMessageBox({
    type: 'warning',
    title: message.title,
    buttons: message.buttons,
    message: message.message,
    noLink: true,
  }).then((res) => {
    if (res.response === 0) webContents.reload()
    else webContents.close()
  })
})`,
      rendererCode: `// Renderer Process (Preload)
// Usually exposed via contextBridge
const crash = {
  start: () => {
    process.crash()
  }
}`,
    },
    [ToolId.OpenWindow]: {
      name: i18nt.value.buttons.openNewWindow,
      avatar: 'i-tdesign-window',
      action: () => {
        invoke(IpcChannel.OpenWin, {
          url: '/not-found',
          title: 'Open New Window',
          width: 1200,
          height: 800,
        })
      },
      mainCode: `// Main Process: src/main/services/ipc/ipc-main-handle.ts
OpenWin: (event, arg) => {
  // ... setup overlay colors ...
  const childWin = new BrowserWindow({
    // ... window config ...
    height: 595,
    width: 1140,
    show: false,
    webPreferences: {
      sandbox: false,
      webSecurity: false,
      preload: getPreloadFile('main-preload'),
    },
  })
  childWin.loadURL(winURL + \`#\${arg.url}\`)
  childWin.once('ready-to-show', () => {
    const { applyTitleBarOverlayBySystemTheme } = useWindowHook()
    applyTitleBarOverlayBySystemTheme(childWin)
    if (arg.IsPay) {
      // ... payment check logic ...
    }
  })
  childWin.once('show', () => {
    webContentSend['send-data-test'](childWin.webContents, arg.sendData)
  })
}`,
      rendererCode: `// Renderer Process
function openWindow() {
  invoke(IpcChannel.OpenWin, {
    url: 'https://github.com/umbrella22/electron-vite-template',
    title: 'Open New Window',
    width: 1200,
    height: 800,
  })
}`,
    },
    [ToolId.Browser]: {
      name: i18nt.value.buttons.browser || 'Browser',
      avatar: 'i-tdesign-internet',
      action: () => invoke(IpcChannel.OpenBrowserDemoWindow),
      mainCode: `// Main Process: src/main/services/window/browser-handle.ts
OpenBrowserDemoWindow: async (event) => {
  this.openBrowserDemoWindow()
}

private openBrowserDemoWindow(): BaseWindow {
  // ... setup window ...
  const win = new BaseWindow({
    // ... config ...
  })
  const view = new WebContentsView({
    webPreferences: {
      // ... config ...
      preload: getPreloadFile('main-preload'),
    },
  })
  win.contentView.addChildView(view)
  // ... setup devtools, loadURL ...
  view.webContents.loadURL(browserDemoURL)
  view.webContents.on('dom-ready', () => {
    win.show()
  })
  // ... handle resize ...
}`,
      rendererCode: `// Renderer Process
async function openBrowser() {
  await invoke(IpcChannel.OpenBrowserDemoWindow)
}`,
    },
    [ToolId.Print]: {
      name: i18nt.value.print?.print || 'Print',
      avatar: 'i-tdesign-printer',
      action: () => invoke(IpcChannel.OpenPrintDemoWindow),
      mainCode: `// Main Process: src/main/services/window/print-handle.ts
OpenPrintDemoWindow: async (event) => {
  this.openPrintDemoWindow()
}

private openPrintDemoWindow(): void {
  if (this.win) {
    this.win.show()
    return
  }
  // ... setup window ...
  this.win = new BrowserWindow({
    // ... config ...
    webPreferences: {
      // ... config ...
      preload: getPreloadFile('main-preload'),
    },
  })
  this.win.loadURL(printURL)
  this.win.on('ready-to-show', () => {
    this.win?.show()
  })
  this.win.on('closed', () => {
    this.win = null
  })
}`,
      rendererCode: `// Renderer Process
async function openPrint() {
  await invoke(IpcChannel.OpenPrintDemoWindow)
}`,
    },
  }
}
