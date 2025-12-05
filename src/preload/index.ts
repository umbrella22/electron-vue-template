import { contextBridge, ipcRenderer, shell } from 'electron'
import { platform, release, arch } from 'os'
import { IpcChannel, InvokeChannelNames } from '@ipcManager/index'

function getIpcRenderer() {
  const IpcRenderer: Record<string, any> = {}

  // 使用 IpcChannel 常量对象来获取所有通道名
  Object.entries(IpcChannel).forEach(([methodName, channelName]) => {
    // 通过 InvokeChannelNames 自动判断是调用类还是监听类
    const isInvokeChannel = InvokeChannelNames.has(methodName)

    if (isInvokeChannel) {
      // 使用 kebab-case 作为键名
      IpcRenderer[channelName] = {
        invoke: async (args?: any) => ipcRenderer.invoke(channelName, args),
      }
    } else {
      // 监听类通道（IpcRendererEventListener）
      // 使用 kebab-case 作为键名
      IpcRenderer[channelName] = {
        on: (listener: (...args: any[]) => void) => {
          ipcRenderer.removeListener(channelName, listener)
          ipcRenderer.on(channelName, listener)
        },
        once: (listener: (...args: any[]) => void) => {
          ipcRenderer.removeListener(channelName, listener)
          ipcRenderer.once(channelName, listener)
        },
        removeAllListeners: () => ipcRenderer.removeAllListeners(channelName),
      }
    }
  })

  return IpcRenderer
}

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
