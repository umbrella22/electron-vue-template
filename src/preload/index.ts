import { contextBridge, ipcRenderer, shell, IpcRendererEvent } from 'electron'
import { platform, release, arch } from 'os'
import { IpcChannel, InvokeChannelNames } from '@ipcManager/index'
import { IpcChannelRendererClass } from '@ipcManager/channel'

type IpcRendererHandler = {
  invoke: (args?: unknown) => Promise<unknown>
  on: (listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => void
  once: (
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
  ) => void
  removeAllListeners: () => void
}

type IpcRendererMap = Record<string, IpcRendererHandler>

function getIpcRenderer(): IpcRendererMap {
  const IpcRenderer: IpcRendererMap = {}
  const rendererKeys = new Set(Object.keys(new IpcChannelRendererClass()))

  Object.entries(IpcChannel).forEach(([methodName, channelName]) => {
    const entry = (IpcRenderer[channelName] ||= {} as IpcRendererHandler)

    if (InvokeChannelNames.has(methodName)) {
      entry.invoke = async (args?: unknown) =>
        ipcRenderer.invoke(channelName, args)
    }

    if (rendererKeys.has(methodName)) {
      entry.on = (
        listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
      ) => {
        ipcRenderer.removeListener(channelName, listener)
        ipcRenderer.on(channelName, listener)
      }

      entry.once = (
        listener: (event: IpcRendererEvent, ...args: unknown[]) => void,
      ) => {
        ipcRenderer.removeListener(channelName, listener)
        ipcRenderer.once(channelName, listener)
      }

      entry.removeAllListeners = () =>
        ipcRenderer.removeAllListeners(channelName)
    }
  })

  return IpcRenderer
}

// 安全说明：通过 contextBridge 暴露的 API 应谨慎设计
// 所有暴露的 API 都经过上下文隔离，但应限制为最小必要权限

contextBridge.exposeInMainWorld('ipcRendererChannel', getIpcRenderer())

contextBridge.exposeInMainWorld('systemInfo', {
  platform: platform(),
  release: release(),
  arch: arch(),
})

contextBridge.exposeInMainWorld('shell', shell)

contextBridge.exposeInMainWorld('crash', {
  start: () => {
    process.crash()
  },
})
