import { BrowserWindow } from 'electron'
import { IIpcHotUpdaterHandle } from '@ipcManager/index'
import { updater } from './hot-updater'

export class HotUpdaterClass implements IIpcHotUpdaterHandle {
  HotUpdate: (event: Electron.IpcMainInvokeEvent) => void | Promise<void> = (
    event,
  ) => {
    const windows = BrowserWindow.fromWebContents(event.sender)
    if (!windows) return
    updater(windows)
  }
}

