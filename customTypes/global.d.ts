import { shell } from 'electron'
import type { IIpcRendererInvoke, IIpcRendererOn } from '@ipcManager/index'
type IpcRendererInvoke = {
  [key in keyof IIpcRendererInvoke]: {
    invoke: IIpcRendererInvoke[key]
  }
}
type IpcRendererOn = {
  [key in keyof IIpcRendererOn]: {
    on: (listener: IIpcRendererOn[key]) => void
    once: (listener: IIpcRendererOn[key]) => void
    removeAllListeners: () => void
  }
}

interface AnyObject {
  [key: string]: any
}

export interface memoryInfo {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

declare global {
  interface Performance {
    memory?: memoryInfo
  }

  interface Window {
    ipcRendererChannel: IpcRendererInvoke & IpcRendererOn
    systemInfo: {
      platform: string
      release: string
      arch: string
      nodeVersion: string
      electronVersion: string
    }
    shell: typeof shell
    crash: {
      start: () => void
    }
  }
}
