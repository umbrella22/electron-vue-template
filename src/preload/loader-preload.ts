import { contextBridge, ipcRenderer } from 'electron'

/**
 * Loader 窗口专用的 preload 脚本
 * 暴露生命周期相关的 IPC 通信 API
 */

// 生命周期更新监听器类型
type LifecycleUpdateData = {
  percent: number
  message: string
  subText: string
  phase: string
}

type LifecycleLogData = {
  message: string
  type: 'info' | 'highlight' | 'error'
}

type LifecycleErrorData = {
  message: string
  code?: string
}

// 暴露生命周期 API 到渲染进程
contextBridge.exposeInMainWorld('lifecycle', {
  /**
   * 监听生命周期更新
   */
  onUpdate: (callback: (data: LifecycleUpdateData) => void) => {
    ipcRenderer.on('lifecycle-update', (_event, data: LifecycleUpdateData) => {
      callback(data)
    })
  },

  /**
   * 监听生命周期日志
   */
  onLog: (callback: (data: LifecycleLogData) => void) => {
    ipcRenderer.on('lifecycle-log', (_event, data: LifecycleLogData) => {
      callback(data)
    })
  },

  /**
   * 监听生命周期错误
   */
  onError: (callback: (data: LifecycleErrorData) => void) => {
    ipcRenderer.on('lifecycle-error', (_event, data: LifecycleErrorData) => {
      callback(data)
    })
  },

  /**
   * 移除所有监听器
   */
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('lifecycle-update')
    ipcRenderer.removeAllListeners('lifecycle-log')
    ipcRenderer.removeAllListeners('lifecycle-error')
  },
})
