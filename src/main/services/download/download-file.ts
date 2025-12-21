import { app, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { ensureDirSync } from 'fs-extra'
import { webContentSend } from '../ipc/web-content-send'
import { useStoreHook } from '@main/hooks/store-hook'

type StartDownloadArgs = {
  id: string
  url: string
}

class DownloadFile {
  private mainWindow: BrowserWindow
  private taskIdByUrl = new Map<string, string>()
  private store = useStoreHook()

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.registerDownloadListeners()
  }

  private resolveTaskId(url: string): string | undefined {
    const direct = this.taskIdByUrl.get(url)
    if (direct) return direct

    try {
      const normalizedUrl = new URL(url)
      normalizedUrl.hash = ''
      normalizedUrl.search = ''
      const normalizedStr = normalizedUrl.toString()
      for (const [taskUrl, taskId] of this.taskIdByUrl.entries()) {
        try {
          const normalizedTaskUrl = new URL(taskUrl)
          normalizedTaskUrl.hash = ''
          normalizedTaskUrl.search = ''
          if (normalizedTaskUrl.toString() === normalizedStr) return taskId
        } catch {}
      }
    } catch {}

    for (const [taskUrl, taskId] of this.taskIdByUrl.entries()) {
      if (url.startsWith(taskUrl)) return taskId
    }

    return undefined
  }

  private registerDownloadListeners() {
    this.mainWindow.webContents.session.on('will-download', (_event, item) => {
      const itemUrl =
        typeof (item as any)?.getURL === 'function'
          ? (item as any).getURL()
          : ''
      const taskId = itemUrl ? this.resolveTaskId(itemUrl) : undefined

      const downloadDir =
        this.store.getValue<string>('downloadPath', app.getPath('downloads')) ||
        app.getPath('downloads')
      ensureDirSync(downloadDir)
      const filePath = join(downloadDir, item.getFilename())
      item.setSavePath(filePath)

      item.on('updated', (_event, state: string) => {
        if (!taskId) return
        switch (state) {
          case 'progressing': {
            const receivedBytes = item.getReceivedBytes()
            const totalBytes = item.getTotalBytes()
            const progress =
              totalBytes > 0
                ? Math.floor((receivedBytes / totalBytes) * 100)
                : 0
            webContentSend['download-progress'](this.mainWindow.webContents, {
              id: taskId,
              progress,
              receivedBytes,
              totalBytes,
            })
            break
          }
          default:
            webContentSend['download-error'](this.mainWindow.webContents, {
              id: taskId,
            })
            dialog.showErrorBox(
              '下载出错',
              '由于网络或其他未知原因导致下载出错',
            )
            break
        }
      })

      item.once('done', (_event, state: string) => {
        if (!taskId) return
        switch (state) {
          case 'completed':
            webContentSend['download-done'](this.mainWindow.webContents, {
              id: taskId,
              filePath,
            })
            break
          case 'interrupted':
            webContentSend['download-error'](this.mainWindow.webContents, {
              id: taskId,
            })
            dialog.showErrorBox(
              '下载出错',
              '由于网络或其他未知原因导致下载出错.',
            )
            break
          default:
            break
        }
      })
    })
  }

  start(args: StartDownloadArgs) {
    this.taskIdByUrl.set(args.url, args.id)
    this.mainWindow.webContents.downloadURL(args.url)
  }
}

export default DownloadFile
